"use client";

/**
 * The browser's single door to the API.
 *
 * Every call goes through here so two things are true at once: each request is
 * a real, inspectable HTTP call in the Network tab, and it is logged to the
 * console with its method, path, status and duration — the editor used Server
 * Actions, which show up as neither.
 *
 * `NEXT_PUBLIC_API_BASE_URL` is the whole story for splitting the backend out.
 * Empty means same-origin (one Dokploy service). Set it to the backend's URL
 * and the frontend talks to another host with no other change.
 */
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const method = options.method ?? "GET";
  const url = `${BASE}${path}`;
  const startedAt = performance.now();

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      // Cross-origin once the backend is its own service; harmless same-origin.
      credentials: "include",
    });
  } catch (cause) {
    // A dropped connection never reaches the server, so nothing else will log
    // it. Say so here or it vanishes.
    console.error(
      `%c[api] ${method} ${path} — network error`,
      "color:#e11d48;font-weight:600",
      cause,
    );
    throw new ApiError("Network unavailable", 0);
  }

  const ms = Math.round(performance.now() - startedAt);
  const ok = response.ok;

  console.info(
    `%c[api] ${method} ${path} → ${response.status} (${ms}ms)`,
    `color:${ok ? "#0d9488" : "#e11d48"};font-weight:600`,
  );

  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!ok) {
    throw new ApiError(
      payload?.error ?? `Request failed (${response.status})`,
      response.status,
    );
  }

  return payload as T;
}

/* Section endpoints, named so call sites read as intent rather than as URLs. */

export const saveSectionContent = (
  id: string,
  content: unknown,
  trigger: string,
) =>
  api<{ savedAt: string }>(`/api/v1/sections/${id}`, {
    method: "PATCH",
    body: { content, trigger },
  });

export const fetchSectionHistory = (id: string) =>
  api<{
    versions: {
      id: string;
      savedAt: string;
      saveTrigger: string;
      isCurrent: boolean;
    }[];
  }>(`/api/v1/sections/${id}`);

export const restoreSection = (id: string, versionId: string) =>
  api<{ savedAt: string }>(`/api/v1/sections/${id}`, {
    method: "POST",
    body: { versionId },
  });
