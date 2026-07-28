"use client";

/**
 * The editor's save pipeline: debounce, coalesce, retry, survive going offline.
 *
 * Its own module rather than hooks inside the content form, because §4 applies
 * to every mutating action — typing, drag, colour, font, image, delete, resize
 * — and only one of those lives in that form.
 *
 * Deliberately in memory. The spec rules out browser storage, and it is also
 * the honest choice: a queue that outlives the tab would promise durability
 * across a crash that nothing here can actually deliver.
 */

/**
 * What caused a save, re-exported from the shared contract.
 *
 * This was a hand-written union of the same nine strings the backend builds its
 * zod enum from. They matched, and nothing made them match: a value added on
 * one side alone meant the editor sending a trigger the API rejected, surfacing
 * as a save that failed for no stated reason. Derived from one list now, so the
 * question cannot come up.
 */
export type { SaveTrigger } from "@/lib/api-contract";
import type { SaveTrigger } from "@/lib/api-contract";

export type SaveState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "saving" }
  | { status: "saved"; at: number; fresh: boolean }
  | { status: "offline"; queued: number }
  | { status: "error"; message: string; attempt: number };

/** Spec §4: two seconds after the last change, whatever the change was. */
export const SAVE_DEBOUNCE_MS = 2000;

/** "Saved successfully" for this long, then it settles to "Last saved 10:30". */
const FRESH_MS = 2500;

const retryDelay = (attempt: number) => Math.min(2 ** attempt * 1000, 15_000);

type Job<T> = {
  key: string;
  trigger: SaveTrigger;
  payload: T;
};

export type SaveQueueOptions<T> = {
  /** Performs one save. Rejecting means "not saved". */
  send: (payload: T, trigger: SaveTrigger) => Promise<{ savedAt: string }>;
  /** Called on every state change so the UI can render it. */
  onState: (state: SaveState) => void;
  /**
   * True when a failure is worth retrying. A rejected schema is not: it will be
   * rejected identically forever, and a retry loop around it is just noise
   * aimed at the server.
   */
  isRetryable?: (error: unknown) => boolean;
};

export class SaveQueue<T> {
  private queue: Job<T>[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private freshTimer: ReturnType<typeof setTimeout> | null = null;
  private inFlight = false;
  private attempt = 0;
  private disposed = false;

  constructor(private readonly options: SaveQueueOptions<T>) {
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.onOnline);
    }
  }

  /**
   * Queue a change. Same key replaces an earlier queued change rather than
   * stacking: two-second debounce over a typed sentence would otherwise send
   * every intermediate word, and only the last one matters.
   */
  push(key: string, payload: T, trigger: SaveTrigger, immediate = false) {
    const existing = this.queue.findIndex((job) => job.key === key);
    const job: Job<T> = { key, payload, trigger };
    if (existing === -1) this.queue.push(job);
    else this.queue[existing] = job;

    this.setState({ status: "pending" });
    this.arm(immediate ? 0 : SAVE_DEBOUNCE_MS);
  }

  /** Send everything now — used before the editor unmounts. */
  flush() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    void this.drain();
  }

  dispose() {
    this.disposed = true;
    if (this.timer) clearTimeout(this.timer);
    if (this.freshTimer) clearTimeout(this.freshTimer);
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.onOnline);
    }
  }

  get depth() {
    return this.queue.length;
  }

  private onOnline = () => {
    // Reconnected: stop waiting out the backoff and flush in order.
    if (this.queue.length) {
      this.attempt = 0;
      this.arm(0);
    }
  };

  private arm(delay: number) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.drain(), delay);
  }

  private setState(state: SaveState) {
    if (this.disposed) return;
    this.options.onState(state);
  }

  private async drain() {
    if (this.disposed || this.inFlight) return;
    if (!this.queue.length) return;

    // Offline is not a failure to retry blindly; hold the queue and say so.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      this.setState({ status: "offline", queued: this.queue.length });
      this.arm(retryDelay(Math.min(this.attempt + 1, 4)));
      return;
    }

    this.inFlight = true;
    this.setState({ status: "saving" });

    // Oldest first: applying queued changes out of order would let a stale
    // edit land on top of a newer one.
    const job = this.queue[0];

    try {
      const { savedAt } = await this.options.send(job.payload, job.trigger);
      this.queue.shift();
      this.attempt = 0;
      this.inFlight = false;

      if (this.queue.length) {
        this.arm(0);
        return;
      }

      const at = new Date(savedAt).getTime();
      this.setState({ status: "saved", at, fresh: true });
      if (this.freshTimer) clearTimeout(this.freshTimer);
      this.freshTimer = setTimeout(
        () => this.setState({ status: "saved", at, fresh: false }),
        FRESH_MS,
      );
    } catch (cause) {
      this.inFlight = false;
      const retryable = this.options.isRetryable?.(cause) ?? true;
      const message =
        cause instanceof Error ? cause.message : "Could not save.";

      if (!retryable) {
        // Drop it: resending the same rejected payload cannot start working.
        this.queue.shift();
        this.setState({ status: "error", message, attempt: 0 });
        return;
      }

      this.attempt += 1;
      this.setState({ status: "error", message, attempt: this.attempt });
      this.arm(retryDelay(this.attempt));
    }
  }
}

/** A rejected Zod schema stays rejected; transport faults do not. */
export function isRetryableSaveError(cause: unknown): boolean {
  const message = cause instanceof Error ? cause.message.toLowerCase() : "";
  return !/required|invalid|must be|expected|too short|too long|not editable/.test(
    message,
  );
}
