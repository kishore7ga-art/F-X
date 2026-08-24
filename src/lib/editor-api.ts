"use client";

/**
 * Every call the editor makes, in one place, through the one API client.
 *
 * The editor used to build its own request layer inline: a `getApiBases()`
 * function returning a *list* of candidate hostnames — the env var, then
 * `localhost:4000`, then a hardcoded `https://api.webxite.org` — which every
 * caller then looped over, trying each in turn and taking the first that did
 * not throw. Three problems, all of them load-bearing:
 *
 *  - A save that succeeded against the first base still left the loop having
 *    *tried* nothing else, but a save that failed silently fell through to the
 *    next host. In production that meant a tenant's autosave could land on
 *    whichever backend answered first, and a failure was indistinguishable from
 *    a success because every error was swallowed by `catch (e) {}`.
 *  - Reads looped too, so a slow first base delayed every read by its timeout.
 *  - `credentials: "include"` was set on some calls and not others, so the same
 *    endpoint was authenticated or not depending on which function called it.
 *
 * `api()` resolves exactly one base from `NEXT_PUBLIC_API_BASE_URL`, always
 * sends credentials, logs every call, and throws `ApiError` with a real status
 * on failure. There is no fallback host, because a fallback host is a silent
 * failure with extra steps.
 */

import { api, ApiError } from "@/lib/api-client";
import { resolveCategory, UNCATEGORISED, type SectionCategoryId } from "@/lib/sections/categories";

/** A section as the editor holds it. Mirrors the server's `StoredSection`. */
export type EditorSection = {
  id: string;
  title: string;
  /** One of the 19 canonical ids, or "custom". Never empty. */
  category: SectionCategoryId | typeof UNCATEGORISED;
  /** Which library template this is showing, when it came from one. */
  templateId: string | null;
  /** Position in that category's variant cycle. */
  variantIndex: number;
  code: string;
};

export type EditorPage = {
  id: string;
  slug: string;
  title: string;
  sections: EditorSection[];
};

/** A library template, ready to become a section. */
export type LibrarySection = {
  id: string;
  name: string;
  category: SectionCategoryId | typeof UNCATEGORISED;
  description: string | null;
  thumbnailUrl: string | null;
  code: string;
};

export type SectionLibrary = {
  sections: LibrarySection[];
  byCategory: Record<string, LibrarySection[]>;
};

/* ── Wire shapes -> editor shapes ───────────────────────────────────────── */

function toSection(raw: unknown, index: number): EditorSection | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Record<string, unknown>;
  const code =
    (typeof entry.code === "string" && entry.code) ||
    (typeof entry.html === "string" && entry.html) ||
    (typeof entry.content === "string" && entry.content) ||
    "";
  if (!code.trim()) return null;

  const variant = Number(entry.variantIndex);

  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : `sec-${index}`,
    title: (typeof entry.title === "string" && entry.title) || "Section",
    category: resolveCategory({
      category: typeof entry.category === "string" ? entry.category : null,
      sectionType: typeof entry.sectionType === "string" ? entry.sectionType : null,
      title: typeof entry.title === "string" ? entry.title : null,
      code,
    }),
    templateId: typeof entry.templateId === "string" && entry.templateId ? entry.templateId : null,
    variantIndex: Number.isFinite(variant) && variant >= 0 ? Math.floor(variant) : 0,
    code,
  };
}

function toPage(raw: unknown): EditorPage | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Record<string, unknown>;
  const slug = typeof entry.slug === "string" ? entry.slug : "";
  if (!slug) return null;

  return {
    id: (typeof entry.id === "string" && entry.id) || `page-${slug.replace(/^\//, "")}`,
    slug,
    title: (typeof entry.title === "string" && entry.title) || slug,
    sections: (Array.isArray(entry.sections) ? entry.sections : [])
      .map(toSection)
      .filter((s): s is EditorSection => s !== null),
  };
}

/** What the editor sends back. Order is array position; the server renumbers. */
function fromSection(section: EditorSection) {
  return {
    id: section.id,
    title: section.title,
    sectionType: section.category,
    templateId: section.templateId,
    variantIndex: section.variantIndex,
    code: section.code,
  };
}

/* ── The calls ──────────────────────────────────────────────────────────── */

/** Every page this college has, with its sections. One request. */
export async function fetchWebsite(): Promise<EditorPage[]> {
  const data = await api<{ pages?: unknown[] }>("/api/v1/my-website");
  return (Array.isArray(data?.pages) ? data.pages : [])
    .map(toPage)
    .filter((p): p is EditorPage => p !== null);
}

/**
 * Save one page. Never touches any other page.
 *
 * This is the whole of the fix for pages bleeding into each other: the request
 * body contains one page, and the server owns the rest. There is no code path
 * from here that can write to a page the user is not editing.
 */
export async function savePage(page: EditorPage): Promise<EditorPage | null> {
  const saved = await api<unknown>(`/api/v1/my-website/pages/${encodeURIComponent(page.slug)}`, {
    method: "PUT",
    body: { title: page.title, sections: page.sections.map(fromSection) },
  });
  return toPage(saved);
}

/**
 * Persist a new section order, by id.
 *
 * Small enough to send on the click rather than after a debounce, which is what
 * makes a reorder survive a refresh two seconds later.
 */
export async function saveSectionOrder(slug: string, sectionIds: string[]): Promise<EditorPage | null> {
  const saved = await api<unknown>(
    `/api/v1/my-website/pages/${encodeURIComponent(slug)}/order`,
    { method: "PATCH", body: { sectionIds } },
  );
  return toPage(saved);
}

export async function deletePage(slug: string): Promise<void> {
  await api(`/api/v1/my-website/pages/${encodeURIComponent(slug)}`, { method: "DELETE" });
}

/**
 * The section library.
 *
 * `/api/v1/section-library`, not `/api/v1/admin/templates`. The latter requires
 * an admin session; a college session fails it, so this returned nothing for
 * every tenant and the editor behaved as designed on an empty library — all
 * nineteen categories greyed out, and Swap Variant reporting a cycle of one.
 */
export async function fetchSectionLibrary(): Promise<SectionLibrary> {
  try {
    const data = await api<SectionLibrary>("/api/v1/section-library");
    return {
      sections: Array.isArray(data?.sections) ? data.sections : [],
      byCategory: data?.byCategory ?? {},
    };
  } catch (error) {
    // An empty library is a legitimate state — a new deployment has none — so
    // this returns one rather than throwing. It is logged loudly because an
    // empty library and an unreachable API look identical on the canvas, and
    // that ambiguity is what made this bug survive as long as it did.
    console.error(
      "[editor] section library unavailable — the Add Section picker and Swap Variant will be empty:",
      error instanceof ApiError ? `${error.status} ${error.message}` : error,
    );
    return { sections: [], byCategory: {} };
  }
}

/** The Super Admin's default website, used to seed a page. Public. */
export async function fetchDefaultWebsite(): Promise<EditorPage[]> {
  try {
    const data = await api<{ pages?: unknown[] }>("/api/v1/default-website");
    return (Array.isArray(data?.pages) ? data.pages : [])
      .map(toPage)
      .filter((p): p is EditorPage => p !== null);
  } catch {
    return [];
  }
}

export type ThemeSelection = { themeId: string | null; fontId: string | null };

export async function fetchTheme(): Promise<ThemeSelection> {
  try {
    return await api<ThemeSelection>("/api/v1/my-theme");
  } catch {
    return { themeId: null, fontId: null };
  }
}

export async function saveTheme(selection: Partial<ThemeSelection>): Promise<void> {
  await api("/api/v1/my-theme", { method: "PUT", body: selection });
}
