"use client";

/**
 * The editor's state, keyed by page.
 *
 * ── The bug this exists to make impossible ─────────────────────────────────
 *
 * Editing one page changed another. There were five overlapping stores —
 * `sections`, `pageStore`, `myWebsiteConfig`, two localStorage keys — and four
 * effects writing between them, none of which carried the page they were
 * writing *for*. The specific failure:
 *
 *   1. `handlePageChange("/about")` called `setCurrentPage` and then an async
 *      `fetchDbSections`. `currentPage.slug` committed immediately; `sections`
 *      still held Home's sections.
 *   2. An effect with deps `[sections, currentPage.slug]` then fired — because
 *      the slug had changed — and wrote `pageStore["/about"] = <Home's
 *      sections>` plus the matching localStorage key.
 *   3. If About came back empty, the guard `sections.length > 0` skipped the
 *      corrective write, so the copy stayed.
 *   4. The 2-second autosave then persisted Home's sections to About.
 *
 * A second path did the same thing: two `fetchDbSections` calls raced on every
 * page switch — one from `handlePageChange`, one from an effect on
 * `[currentPage.slug]` — and whichever resolved last won.
 *
 * ── Why this shape ────────────────────────────────────────────────────────
 *
 * One reducer, one store, and *every action names the page it applies to*. A
 * mutation for `/about` cannot land on `/home` because there is no code path
 * that reads "the current page" while writing. `activePageId` is a pointer for
 * rendering, never an implicit target for a write.
 *
 * Loads are guarded by a request token per page, so a slow response for a page
 * the user has already left is discarded rather than applied.
 *
 * Saves go through a per-page queue: one request in flight per page, the next
 * coalesced behind it. A page that is saving cannot block another page's save,
 * and two rapid edits to one page cannot land out of order.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import {
  deletePage as deletePageRequest,
  fetchDefaultWebsite,
  fetchWebsite,
  savePage as savePageRequest,
  saveSectionOrder,
  type EditorPage,
  type EditorSection,
} from "@/lib/editor-api";

/** A page's slug, canonicalised. The key for everything in this module. */
export type PageId = string;

export function canonicalSlug(raw: string | null | undefined): PageId {
  const value = String(raw ?? "").trim().toLowerCase();
  const trimmed = value.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!trimmed) return "";
  return `/${trimmed.replace(/\s+/g, "-").replace(/[^a-z0-9/_-]/g, "")}`;
}

export type PageStatus = "unloaded" | "loading" | "ready";

export type PageState = {
  id: PageId;
  slug: string;
  title: string;
  sections: EditorSection[];
  status: PageStatus;
  /** Changed since the last successful save. */
  dirty: boolean;
  /** Created in this session and never saved. Opens empty; never seeded. */
  fresh: boolean;
  /** The last save's failure, or null. Shown rather than swallowed. */
  error: string | null;
};

export type EditorState = {
  pages: Record<PageId, PageState>;
  /** Insertion order, so the page list is stable. */
  order: PageId[];
  activePageId: PageId;
  /** Index into the active page's sections, or null for "nothing selected". */
  activeSectionIndex: number | null;
  /** Undo/redo, per page. Switching pages does not discard either. */
  history: Record<PageId, EditorSection[][]>;
  future: Record<PageId, EditorSection[][]>;
  /** True until the first `/api/v1/my-website` response, success or failure. */
  booting: boolean;
};

export type Action =
  | { type: "boot"; pages: EditorPage[]; activePageId: PageId }
  | { type: "bootFailed" }
  | { type: "selectPage"; pageId: PageId; title?: string }
  | { type: "createPage"; pageId: PageId; title: string }
  | { type: "removePage"; pageId: PageId }
  | { type: "pageLoading"; pageId: PageId }
  | { type: "pageLoaded"; pageId: PageId; page: EditorPage }
  /** A section mutation. `sections` is the page's complete new list. */
  | { type: "setSections"; pageId: PageId; sections: EditorSection[]; record: boolean }
  | { type: "selectSection"; index: number | null }
  /**
   * A save came back. `snapshot` is the exact array that was sent, so the
   * reducer can tell a clean save from one that raced an edit: if the page's
   * sections are no longer that array, the user typed during the round trip and
   * the page stays dirty.
   */
  | { type: "markSaved"; pageId: PageId; snapshot: EditorSection[]; page: EditorPage | null }
  /** A reorder landed. Ids and order only — never clears `dirty`. */
  | { type: "orderSaved"; pageId: PageId; sections: EditorSection[] }
  | { type: "saveFailed"; pageId: PageId; message: string }
  | { type: "undo"; pageId: PageId }
  | { type: "redo"; pageId: PageId };

const HISTORY_LIMIT = 50;

function titleFromSlug(slug: PageId): string {
  const base = slug.replace(/^\//, "").replace(/[-_/]+/g, " ").trim();
  if (!base) return "Home";
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

function blankPage(pageId: PageId, title?: string, fresh = false): PageState {
  return {
    id: pageId,
    slug: pageId,
    title: title || titleFromSlug(pageId),
    sections: [],
    status: fresh ? "ready" : "unloaded",
    dirty: false,
    fresh,
    error: null,
  };
}

function fromApi(page: EditorPage): PageState {
  const id = canonicalSlug(page.slug);
  return {
    id,
    slug: id,
    title: page.title || titleFromSlug(id),
    sections: page.sections,
    status: "ready",
    dirty: false,
    fresh: false,
    error: null,
  };
}

/** Adds a page id to `order` if it is new, preserving insertion order. */
function withOrder(order: PageId[], pageId: PageId): PageId[] {
  return order.includes(pageId) ? order : [...order, pageId];
}

export function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case "boot": {
      const pages: Record<PageId, PageState> = {};
      const order: PageId[] = [];
      action.pages.forEach((page) => {
        const entry = fromApi(page);
        pages[entry.id] = entry;
        if (!order.includes(entry.id)) order.push(entry.id);
      });

      // The page the user asked for always exists after boot, even when the
      // config has never heard of it. It is `unloaded`, not `ready`: the loader
      // decides whether that means "seed me" or "I am genuinely empty", and it
      // needs to be able to tell those apart.
      const activePageId = action.activePageId;
      if (!pages[activePageId]) {
        pages[activePageId] = blankPage(activePageId);
        order.unshift(activePageId);
      }

      return {
        ...state,
        pages,
        order,
        activePageId,
        activeSectionIndex: pages[activePageId]!.sections.length > 0 ? 0 : null,
        booting: false,
      };
    }

    case "bootFailed":
      return { ...state, booting: false };

    case "selectPage": {
      if (action.pageId === state.activePageId) return state;
      const existing = state.pages[action.pageId];
      const page = existing ?? blankPage(action.pageId, action.title);
      return {
        ...state,
        // The page being left is not touched. Its sections stay exactly as they
        // are, in its own slot, and its pending save (if any) carries its own
        // page id and completes on its own.
        pages: { ...state.pages, [action.pageId]: page },
        order: withOrder(state.order, action.pageId),
        activePageId: action.pageId,
        activeSectionIndex: page.sections.length > 0 ? 0 : null,
      };
    }

    case "createPage": {
      // `fresh` is what stops a brand-new page being filled with the home
      // page's sections: the loader will not seed it, and it opens genuinely
      // empty until the user adds something.
      const page = blankPage(action.pageId, action.title, true);
      return {
        ...state,
        pages: { ...state.pages, [action.pageId]: page },
        order: withOrder(state.order, action.pageId),
        activePageId: action.pageId,
        activeSectionIndex: null,
      };
    }

    case "removePage": {
      const pages = { ...state.pages };
      delete pages[action.pageId];
      const order = state.order.filter((id) => id !== action.pageId);
      const activePageId =
        state.activePageId === action.pageId ? order[0] ?? "/home" : state.activePageId;
      return {
        ...state,
        pages,
        order,
        activePageId,
        activeSectionIndex: pages[activePageId]?.sections.length ? 0 : null,
      };
    }

    case "pageLoading": {
      const page = state.pages[action.pageId] ?? blankPage(action.pageId);
      return {
        ...state,
        pages: { ...state.pages, [action.pageId]: { ...page, status: "loading" } },
        order: withOrder(state.order, action.pageId),
      };
    }

    case "pageLoaded": {
      const loaded = fromApi(action.page);
      // Preserve `fresh` and any unsaved work: a load that arrives after the
      // user has started editing must not discard what they typed.
      const existing = state.pages[action.pageId];
      const page = existing?.dirty ? { ...existing, status: "ready" as const } : loaded;
      return {
        ...state,
        pages: { ...state.pages, [action.pageId]: page },
        order: withOrder(state.order, action.pageId),
        activeSectionIndex:
          state.activePageId === action.pageId
            ? page.sections.length > 0
              ? Math.min(state.activeSectionIndex ?? 0, page.sections.length - 1)
              : null
            : state.activeSectionIndex,
      };
    }

    case "setSections": {
      const page = state.pages[action.pageId];
      if (!page) return state;

      const history = action.record
        ? {
            ...state.history,
            [action.pageId]: [...(state.history[action.pageId] ?? []), page.sections].slice(
              -HISTORY_LIMIT,
            ),
          }
        : state.history;
      const future = action.record ? { ...state.future, [action.pageId]: [] } : state.future;

      const next: PageState = {
        ...page,
        sections: action.sections,
        // No longer fresh the moment it holds anything: a page with sections is
        // a page, and reopening it must load what was saved rather than seed.
        fresh: page.fresh && action.sections.length === 0,
        dirty: true,
        status: "ready",
        error: null,
      };

      return {
        ...state,
        pages: { ...state.pages, [action.pageId]: next },
        history,
        future,
        activeSectionIndex:
          state.activePageId === action.pageId && state.activeSectionIndex !== null
            ? Math.min(state.activeSectionIndex, Math.max(0, action.sections.length - 1))
            : state.activeSectionIndex,
      };
    }

    case "selectSection":
      return { ...state, activeSectionIndex: action.index };

    case "markSaved": {
      const page = state.pages[action.pageId];
      if (!page) return state;

      // Raced: the user edited during the round trip. Keep what they typed and
      // leave the page dirty so the queue saves again. Applying the server's
      // copy here is how the last keystroke before a refresh gets lost.
      if (page.sections !== action.snapshot) {
        return { ...state, pages: { ...state.pages, [action.pageId]: { ...page, error: null } } };
      }

      // Clean: the server's normalised copy is authoritative for ids and order.
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.pageId]: {
            ...page,
            sections: action.page?.sections ?? page.sections,
            dirty: false,
            error: null,
          },
        },
      };
    }

    case "orderSaved": {
      const page = state.pages[action.pageId];
      if (!page) return state;
      // Only the order is taken from the response; the local `code` for each
      // section is kept, because an inline edit made since the reorder request
      // went out is newer than anything the server sent back.
      const byId = new Map(page.sections.map((s) => [s.id, s]));
      const reordered = action.sections.map((s) => byId.get(s.id) ?? s);
      return {
        ...state,
        pages: { ...state.pages, [action.pageId]: { ...page, sections: reordered, error: null } },
      };
    }

    case "saveFailed": {
      const page = state.pages[action.pageId];
      if (!page) return state;
      return {
        ...state,
        pages: { ...state.pages, [action.pageId]: { ...page, error: action.message } },
      };
    }

    case "undo": {
      const stack = state.history[action.pageId] ?? [];
      const page = state.pages[action.pageId];
      if (!page || stack.length === 0) return state;
      const previous = stack[stack.length - 1]!;
      return {
        ...state,
        pages: { ...state.pages, [action.pageId]: { ...page, sections: previous, dirty: true } },
        history: { ...state.history, [action.pageId]: stack.slice(0, -1) },
        future: { ...state.future, [action.pageId]: [...(state.future[action.pageId] ?? []), page.sections] },
        activeSectionIndex: previous.length > 0 ? Math.min(state.activeSectionIndex ?? 0, previous.length - 1) : null,
      };
    }

    case "redo": {
      const stack = state.future[action.pageId] ?? [];
      const page = state.pages[action.pageId];
      if (!page || stack.length === 0) return state;
      const next = stack[stack.length - 1]!;
      return {
        ...state,
        pages: { ...state.pages, [action.pageId]: { ...page, sections: next, dirty: true } },
        future: { ...state.future, [action.pageId]: stack.slice(0, -1) },
        history: { ...state.history, [action.pageId]: [...(state.history[action.pageId] ?? []), page.sections] },
        activeSectionIndex: next.length > 0 ? Math.min(state.activeSectionIndex ?? 0, next.length - 1) : null,
      };
    }

    default:
      return state;
  }
}

function initialState(activePageId: PageId): EditorState {
  return {
    pages: { [activePageId]: blankPage(activePageId) },
    order: [activePageId],
    activePageId,
    activeSectionIndex: null,
    history: {},
    future: {},
    booting: true,
  };
}

const AUTOSAVE_DELAY_MS = 1200;

export function useEditorPages(initialSlug = "/home") {
  const rootPageId = canonicalSlug(initialSlug) || "/home";
  const [state, dispatch] = useReducer(reducer, rootPageId, initialState);

  /**
   * The most recent load request per page.
   *
   * A response is applied only if its token is still the page's current one.
   * Without this, switching Home -> About -> Home applies About's response to
   * Home if About's request happens to be slower, which is the non-deterministic
   * half of "sections from another page appear".
   */
  const loadToken = useRef<Record<PageId, number>>({});
  /** Per-page save queue: the in-flight promise, and whether another is due. */
  const saveState = useRef<Record<PageId, { running: boolean; queued: boolean }>>({});
  const timers = useRef<Record<PageId, ReturnType<typeof setTimeout>>>({});
  /**
   * The current state, readable from an async callback.
   *
   * Synced in an effect rather than assigned during render: React 19 forbids
   * writing a ref while rendering, and it is unnecessary here — every reader is
   * a timer, a promise continuation or an event handler, all of which run after
   * the commit that this effect runs in.
   */
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  }, [state]);

  /**
   * Removes the localStorage the editor used to keep sections in.
   *
   * Three key families: `xite_saved_pages_<subdomain>`,
   * `xite_active_sections_<subdomain>_<page>`, and an early unscoped
   * `xite_saved_pages` shared by every tenant that had ever signed in on the
   * browser. Nothing reads or writes any of them now — the database is the only
   * store — so what is left is a copy of somebody's sections with nothing to
   * invalidate it, in the same browser as the next tenant to sign in.
   *
   * Cleared rather than left dormant because the last three bugs in this area
   * were all "the browser had an older copy and something read it".
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stale = Object.keys(localStorage).filter(
        (key) =>
          key.startsWith("xite_saved_pages") ||
          key.startsWith("xite_active_sections") ||
          key.startsWith("xite_theme_palette") ||
          key.startsWith("xite_theme_font"),
      );
      stale.forEach((key) => localStorage.removeItem(key));
      if (stale.length > 0) {
        console.info(`[editor] cleared ${stale.length} stale local section cache key(s).`);
      }
    } catch {
      // A browser with storage disabled has nothing to clear.
    }
  }, []);

  /* ── Loading ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const pages = await fetchWebsite();
        if (!cancelled) dispatch({ type: "boot", pages, activePageId: rootPageId });
      } catch (error) {
        console.error("[editor] could not load this college's website:", error);
        if (!cancelled) dispatch({ type: "bootFailed" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rootPageId]);

  /**
   * Fill a page that has never been saved from the Super Admin's default.
   *
   * Only for a page the admin has a specific opinion about. There is no
   * fallback to `/home` — falling back to the home page is exactly how creating
   * "Admissions" used to silently produce a copy of the home page, which the
   * autosave then made permanent.
   */
  const seedFromDefaults = useCallback(async (pageId: PageId): Promise<EditorSection[]> => {
    const defaults = await fetchDefaultWebsite();
    const match = defaults.find((p) => canonicalSlug(p.slug) === pageId);
    return match ? match.sections : [];
  }, []);

  const loadPage = useCallback(
    async (pageId: PageId) => {
      const page = latest.current.pages[pageId];
      // A page created in this session has nothing to load and nothing to seed
      // from. It opens empty and stays that way until the user adds a section.
      if (page?.fresh) return;
      if (page?.status === "ready" || page?.status === "loading") return;

      const token = (loadToken.current[pageId] ?? 0) + 1;
      loadToken.current[pageId] = token;
      dispatch({ type: "pageLoading", pageId });

      try {
        const pages = await fetchWebsite();
        if (loadToken.current[pageId] !== token) return;

        const match = pages.find((p) => canonicalSlug(p.slug) === pageId);
        if (match && match.sections.length > 0) {
          dispatch({ type: "pageLoaded", pageId, page: match });
          return;
        }

        const seeded = await seedFromDefaults(pageId);
        if (loadToken.current[pageId] !== token) return;

        dispatch({
          type: "pageLoaded",
          pageId,
          page: {
            id: match?.id ?? `page-${pageId.replace(/^\//, "")}`,
            slug: pageId,
            title: match?.title ?? titleFromSlug(pageId),
            sections: seeded,
          },
        });
      } catch (error) {
        console.error(`[editor] could not load ${pageId}:`, error);
        if (loadToken.current[pageId] !== token) return;
        // An empty page is the honest answer to a failed load. It is marked
        // ready but not dirty, so nothing autosaves over what is in the
        // database — a load failure must never become a data loss.
        dispatch({
          type: "pageLoaded",
          pageId,
          page: { id: `page-${pageId.replace(/^\//, "")}`, slug: pageId, title: titleFromSlug(pageId), sections: [] },
        });
      }
    },
    [seedFromDefaults],
  );

  // Load the active page whenever it is not already loaded. One effect, one
  // caller — the page-switch handler does not also fetch, so there is never
  // more than one request in flight for a page.
  useEffect(() => {
    if (state.booting) return;
    void loadPage(state.activePageId);
  }, [state.booting, state.activePageId, loadPage]);

  /* ── Saving ──────────────────────────────────────────────────────────── */

  const runSave = useCallback(async (pageId: PageId) => {
    const queue = (saveState.current[pageId] ??= { running: false, queued: false });
    if (queue.running) {
      queue.queued = true;
      return;
    }
    queue.running = true;

    try {
      for (;;) {
        queue.queued = false;
        const page = latest.current.pages[pageId];
        if (!page || !page.dirty) break;

        // Captured before the request so the response can be compared against
        // it: if the user typed during the round trip the page is dirty again,
        // and the server's copy must not be applied over the newer edit.
        const snapshot = page.sections;
        try {
          const saved = await savePageRequest({
            id: page.id,
            slug: page.slug,
            title: page.title,
            sections: snapshot,
          });
          dispatch({ type: "markSaved", pageId, snapshot, page: saved });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Could not save";
          console.error(`[editor] save failed for ${pageId}:`, error);
          dispatch({ type: "saveFailed", pageId, message });
          break;
        }

        if (!queue.queued && !latest.current.pages[pageId]?.dirty) break;
      }
    } finally {
      queue.running = false;
    }
  }, []);

  /** Save this page now, cancelling its pending debounce. */
  const flush = useCallback(
    (pageId: PageId) => {
      const timer = timers.current[pageId];
      if (timer) {
        clearTimeout(timer);
        delete timers.current[pageId];
      }
      void runSave(pageId);
    },
    [runSave],
  );

  // One debounce per page. A page's timer is not reset by an edit to another
  // page, so switching away from a page mid-edit still saves it.
  useEffect(() => {
    Object.values(state.pages).forEach((page) => {
      if (!page.dirty || page.status !== "ready") return;
      if (timers.current[page.id]) return;
      timers.current[page.id] = setTimeout(() => {
        delete timers.current[page.id];
        void runSave(page.id);
      }, AUTOSAVE_DELAY_MS);
    });
  }, [state.pages, runSave]);

  // Anything still pending when the tab closes. `flush` here is best-effort by
  // nature; the debounce is short enough that it rarely has work to do.
  useEffect(() => {
    const onHide = () => {
      Object.values(latest.current.pages).forEach((page) => {
        if (page.dirty) flush(page.id);
      });
    };
    // Captured now: `timers.current` is a different object by the time this
    // cleanup runs, and clearing the wrong one leaves real timers pending.
    const pending = timers.current;
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      Object.values(pending).forEach(clearTimeout);
    };
  }, [flush]);

  /* ── The API this hook offers ────────────────────────────────────────── */

  const activePage = state.pages[state.activePageId] ?? blankPage(state.activePageId);

  /**
   * Change the active page's sections.
   *
   * The page id is captured at call time, not read at apply time, so a mutation
   * dispatched just before a page switch still lands on the page it was made
   * for. That single detail is what makes cross-page contamination structurally
   * impossible rather than merely unlikely.
   */
  const mutateSections = useCallback(
    (
      updater: (sections: EditorSection[]) => EditorSection[],
      options: { record?: boolean; pageId?: PageId } = {},
    ) => {
      const pageId = options.pageId ?? latest.current.activePageId;
      const page = latest.current.pages[pageId];
      if (!page) return;

      const next = updater(page.sections);
      if (next === page.sections) return;

      dispatch({ type: "setSections", pageId, sections: next, record: options.record ?? true });
    },
    [],
  );

  /**
   * Persist a new order immediately, by id.
   *
   * Called on the click rather than through the debounce. Move-up used to
   * persist only via a 2-second debounce that re-sent every page's full markup,
   * so two quick presses and a refresh wrote nothing — the reported "order does
   * not save". This request carries ids only and returns in one round trip.
   */
  const persistOrder = useCallback(
    async (pageId: PageId, sectionIds: string[]) => {
      try {
        const saved = await saveSectionOrder(pageId, sectionIds);
        // Not `markSaved`: a reorder does not clear the dirty flag, because the
        // page may also be carrying an unsaved text edit that this request did
        // not include. The debounced full-page save still owes that.
        if (saved) dispatch({ type: "orderSaved", pageId, sections: saved.sections });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not save the new order";
        console.error(`[editor] reorder failed for ${pageId}:`, error);
        dispatch({ type: "saveFailed", pageId, message });
        // Fall back to the full-page save, which will retry through the queue.
        flush(pageId);
      }
    },
    [flush],
  );

  const selectPage = useCallback((slug: string, title?: string) => {
    const pageId = canonicalSlug(slug);
    if (!pageId) return;
    dispatch({ type: "selectPage", pageId, title });
  }, []);

  const createPage = useCallback((slug: string, title: string) => {
    const pageId = canonicalSlug(slug);
    if (!pageId) return;
    dispatch({ type: "createPage", pageId, title });
  }, []);

  /**
   * Delete a page, from the database as well as from this store.
   *
   * The drawer's delete button used to filter a local array and say "Page
   * deleted successfully." Nothing called the API — `deletePage` in
   * `editor-api.ts` had no caller at all — so the page was still in MongoDB,
   * still published, and back on the list the moment the editor's own page
   * list re-rendered over the local one. The tenant was told a thing that had
   * not happened, twice: once by the toast and once by the page disappearing.
   *
   * The local removal happens only after the server confirms, so a failed
   * delete leaves the page where it is rather than hiding a page that still
   * exists. The caller gets the error to show.
   */
  const deletePage = useCallback(
    async (slug: string): Promise<void> => {
      const pageId = canonicalSlug(slug);
      if (!pageId) throw new Error("That page has no address.");

      /**
       * A page nobody has saved yet is not in the database, so asking the
       * server to delete it would 404 on a page the tenant can plainly see.
       * Removing it locally is the whole of the work.
       */
      const known = latest.current.pages[pageId];
      if (known && known.fresh) {
        dispatch({ type: "removePage", pageId });
        return;
      }

      await deletePageRequest(pageId);
      dispatch({ type: "removePage", pageId });
    },
    [],
  );

  const pages = useMemo(
    () => state.order.map((id) => state.pages[id]).filter((p): p is PageState => Boolean(p)),
    [state.order, state.pages],
  );

  return {
    state,
    pages,
    activePage,
    activeSectionIndex: state.activeSectionIndex,
    booting: state.booting,
    canUndo: (state.history[state.activePageId]?.length ?? 0) > 0,
    canRedo: (state.future[state.activePageId]?.length ?? 0) > 0,
    selectPage,
    createPage,
    removePage: useCallback((slug: string) => dispatch({ type: "removePage", pageId: canonicalSlug(slug) }), []),
    deletePage,
    selectSection: useCallback((index: number | null) => dispatch({ type: "selectSection", index }), []),
    mutateSections,
    persistOrder,
    undo: useCallback(() => dispatch({ type: "undo", pageId: latest.current.activePageId }), []),
    redo: useCallback(() => dispatch({ type: "redo", pageId: latest.current.activePageId }), []),
    flush,
    reload: useCallback((slug: string) => void loadPage(canonicalSlug(slug)), [loadPage]),
  };
}
