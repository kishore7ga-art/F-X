/**
 * Reading a published site's sections out of whatever the API answered.
 *
 * Three endpoints can serve a site — the public one, the editor one, and the
 * platform default — and they wrap the same section array in three slightly
 * different envelopes. Both the server render and the browser's refresh need to
 * unwrap them the same way, so the unwrapping lives here rather than inside the
 * viewer, which is a client component and therefore cannot lend its functions to
 * a Server Component.
 */

export type SectionItem = {
  id: string;
  title: string;
  code: string;
};

/** The section array, whichever envelope it arrived in. */
export function pickSections(data: unknown): unknown[] {
  const payload = (data || {}) as {
    sections?: unknown[];
    pages?: { sections?: unknown[] }[];
  };
  if (Array.isArray(payload.sections) && payload.sections.length > 0) return payload.sections;
  const first = Array.isArray(payload.pages) ? payload.pages[0] : undefined;
  if (first && Array.isArray(first.sections)) return first.sections;
  return [];
}

/**
 * Trims an API section to the three fields that decide what renders.
 *
 * `code` is the section: raw HTML, authored in the Admin, rendered verbatim. The
 * id and title are only ever used for keying and for spotting the header, so
 * everything else the API sends is dropped here rather than carried around.
 */
export function normalizeSections(raw: unknown[]): SectionItem[] {
  return raw.map((entry, idx) => {
    const sec = (entry || {}) as { id?: string; title?: string; code?: string };
    return {
      id: sec.id || `sec-${idx}`,
      title: sec.title || `Section ${idx + 1}`,
      code: sec.code || "",
    };
  });
}
