"use client";

/**
 * Temporary debug/verification overlay for the section toolbar's controls.
 *
 * Not part of the editing experience — a floating HUD that (1) watches the
 * live computed style of whatever is targeted on the canvas so a developer
 * can see a control's effect land in real time, and (2) can run a scripted
 * pass through every control category (Layout, Buttons, Background, Shadow)
 * using the exact same `applyControl` → `onPatch` path the real toolbar
 * uses, then report each step's expected vs. actual computed CSS.
 *
 * Deliberately gated out of production by the caller (see `EditorStudio`'s
 * `toolbarDebugEnabled`) — this reads `document.querySelector` against the
 * live canvas and is only meaningful while a section's panel is open.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyControl,
  type ControlValue,
  type EditableSection,
  type SectionPatch,
} from "@/lib/sections/section-edit";
import { allControls, buildSectionSchema, type Control } from "@/lib/sections/section-schema";
import { ELEMENT_KEY_ATTR, splitSectionCode, type Device } from "@/lib/sections/section-managed-css";
import type { SectionCategory } from "@/lib/sections/section-capabilities";
import { getAttribute, parseHtml } from "@/lib/sections/html-dom";
import { resolvePath } from "@/lib/sections/section-probe";

type Props = {
  section: { id: string; title: string; code: string; category: string };
  device: Device;
  onPatch: (patch: SectionPatch) => void;
  selectedCanvasElement?: HTMLElement | null;
};

type TestStatus = "PASS" | "FAIL";

type TestResult = {
  control: string;
  action: string;
  expected: string;
  actual: string;
  status: TestStatus;
};

/** The five properties the HUD's live watcher keeps an eye on. */
const WATCHED_PROPS = ["gap", "background-image", "background-color", "border-radius", "box-shadow", "color"] as const;

function cssEscape(value: string): string {
  return typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value.replace(/["\\]/g, "\\$&");
}

function hexToRgbString(hex: string): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function normalizeColor(value: string): string {
  const match = /^rgba?\(([^)]+)\)$/.exec(value.trim());
  if (!match) return value.trim();
  const parts = match[1]!.split(",").map((part) => Number.parseFloat(part.trim()));
  return `rgb(${Math.round(parts[0] ?? 0)}, ${Math.round(parts[1] ?? 0)}, ${Math.round(parts[2] ?? 0)})`;
}

type Check =
  | { kind: "exact"; expected: string }
  | { kind: "colorEquals"; hex: string }
  | { kind: "changed" }
  | { kind: "contains"; substr: string };

function evaluate(check: Check, before: string, after: string): boolean {
  switch (check.kind) {
    case "exact":
      return after.trim() === check.expected;
    case "colorEquals":
      return normalizeColor(after) === hexToRgbString(check.hex);
    case "changed":
      return after.trim() !== before.trim();
    case "contains":
      return after.includes(check.substr);
  }
}

type DiagStep = {
  group: string;
  name: string;
  action: string;
  controlId: string;
  value: ControlValue;
  cssProp: string;
  expectedLabel: string;
  check: Check;
};

const SAMPLE_IMAGE_URL = "https://picsum.photos/800/600";
/** Mirrors the "Soft" preset in `section-schema.ts`'s BUTTON_SHADOW_OPTIONS. */
const SOFT_BUTTON_SHADOW = "0 4px 14px -2px rgba(0, 0, 0, 0.12)";

function buildSteps(hasButtons: boolean): DiagStep[] {
  const steps: DiagStep[] = [
    {
      group: "Layout",
      name: "Element Gap",
      action: "Slide gap to 32px",
      controlId: "layout-gap",
      value: "32px",
      cssProp: "gap",
      expectedLabel: "gap: 32px",
      check: { kind: "exact", expected: "32px" },
    },
    {
      group: "Layout",
      name: "Element Gap — Auto",
      action: "Click Auto (clear override)",
      controlId: "layout-gap",
      value: "",
      cssProp: "gap",
      expectedLabel: "gap resets to authored/default",
      check: { kind: "changed" },
    },
  ];

  if (hasButtons) {
    steps.push(
      {
        group: "Buttons",
        name: "Corner Radius",
        action: "Slide radius to 12px",
        controlId: "btn-0-radius",
        value: "12px",
        cssProp: "border-radius",
        expectedLabel: "border-radius: 12px",
        check: { kind: "exact", expected: "12px" },
      },
      {
        group: "Buttons",
        name: "Shadow — Soft",
        action: "Select Soft shadow pill",
        controlId: "btn-0-shadow",
        value: SOFT_BUTTON_SHADOW,
        cssProp: "box-shadow",
        expectedLabel: SOFT_BUTTON_SHADOW,
        check: { kind: "changed" },
      },
      {
        group: "Buttons",
        name: "Background Colour",
        action: "Pick #2563eb",
        controlId: "btn-0-bg",
        value: "#2563eb",
        cssProp: "background-color",
        expectedLabel: "background-color: #2563eb",
        check: { kind: "colorEquals", hex: "#2563eb" },
      },
      {
        group: "Buttons",
        name: "Text Colour",
        action: "Pick #ffffff",
        controlId: "btn-0-color",
        value: "#ffffff",
        cssProp: "color",
        expectedLabel: "color: #ffffff",
        check: { kind: "colorEquals", hex: "#ffffff" },
      },
      {
        group: "Buttons",
        name: "Border Stroke",
        action: "Slide border to 2px",
        controlId: "btn-0-border",
        value: "2px",
        cssProp: "border-width",
        expectedLabel: "border-width: 2px",
        check: { kind: "exact", expected: "2px" },
      },
    );
  }

  steps.push(
    {
      group: "Background",
      name: "Colour",
      action: "Pick #0ea5e9",
      controlId: "bg-color",
      value: "#0ea5e9",
      cssProp: "background-color",
      expectedLabel: "background-color: #0ea5e9",
      check: { kind: "colorEquals", hex: "#0ea5e9" },
    },
    {
      group: "Background",
      name: "Image URL",
      action: `Set image to ${SAMPLE_IMAGE_URL}`,
      controlId: "bg-image",
      value: SAMPLE_IMAGE_URL,
      cssProp: "background-image",
      expectedLabel: `url("${SAMPLE_IMAGE_URL}") + cover`,
      check: { kind: "contains", substr: SAMPLE_IMAGE_URL },
    },
    {
      group: "Background",
      name: "Opacity",
      action: "Slide opacity to 0.5",
      controlId: "root-opacity",
      value: "0.5",
      cssProp: "opacity",
      expectedLabel: "opacity: 0.5",
      check: { kind: "exact", expected: "0.5" },
    },
    {
      group: "Shadow",
      name: "Elevated preset",
      action: "Set x/y/blur/spread/colour/opacity",
      controlId: "shadow-y",
      value: "20px",
      cssProp: "box-shadow",
      expectedLabel: "box-shadow includes 20px offset",
      check: { kind: "changed" },
    },
  );

  return steps;
}

async function waitFor(
  read: () => string,
  predicate: (value: string) => boolean,
  timeoutMs = 1500,
  intervalMs = 40,
): Promise<string> {
  const start = performance.now();
  let last = read();
  while (performance.now() - start < timeoutMs) {
    last = read();
    if (predicate(last)) return last;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return last;
}

function targetLabel(el: HTMLElement | null, fallbackSectionId: string): string {
  if (!el) return `section#${fallbackSectionId}`;
  const key = el.getAttribute(ELEMENT_KEY_ATTR);
  return `${el.tagName.toLowerCase()}${key ? `#${key}` : el.id ? `#${el.id}` : ""}`;
}

export function ToolbarTestHarness({ section, device, onPatch, selectedCanvasElement = null }: Props) {
  const [watch, setWatch] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<{ label: string; ok: boolean } | null>(null);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<TestResult[]>([]);
  const prevWatchRef = useRef<Record<string, string>>({});
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const showFlash = useCallback((label: string, ok: boolean) => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setFlash({ label, ok });
    flashTimerRef.current = setTimeout(() => setFlash(null), 1200);
  }, []);

  /** Live computed-style watcher: polls the current target ~4x/sec via rAF. */
  useEffect(() => {
    let lastSample = 0;
    const tick = (t: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (t - lastSample < 250) return;
      lastSample = t;

      const sectionEl = document.querySelector<HTMLElement>(`[data-xite-section="${cssEscape(section.id)}"]`);
      const el = selectedCanvasElement ?? sectionEl;
      if (!el) return;
      const computed = getComputedStyle(el);
      const next: Record<string, string> = {};
      WATCHED_PROPS.forEach((prop) => {
        next[prop] = computed.getPropertyValue(prop);
      });

      const prev = prevWatchRef.current;
      const changed = WATCHED_PROPS.some((prop) => prev[prop] !== undefined && prev[prop] !== next[prop]);
      if (changed) {
        const diffs = WATCHED_PROPS.filter((prop) => prev[prop] !== undefined && prev[prop] !== next[prop])
          .map((prop) => `${prop}: ${prev[prop]} → ${next[prop]}`)
          .join(", ");
        console.log(`[TEST HUD] State updated — ${diffs}`);
        showFlash("PASS: State Updated", true);
      }
      prevWatchRef.current = next;
      setWatch(next);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [section.id, selectedCanvasElement, showFlash]);

  const runDiagnostics = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setReport([]);

    const results: TestResult[] = [];
    let currentCode = section.code;
    const schema = buildSectionSchema({ code: currentCode, category: section.category as SectionCategory });
    const controls = allControls(schema);
    const hasButtons = schema.groups.some((g) => g.id === "buttons");
    const steps = buildSteps(hasButtons);

    for (const step of steps) {
      const control: Control | undefined = controls.find((c) => c.id === step.controlId);
      if (!control) {
        results.push({ control: `${step.group} — ${step.name}`, action: step.action, expected: step.expectedLabel, actual: "control not found in this section", status: "FAIL" });
        setReport([...results]);
        continue;
      }

      const editable: EditableSection = { title: section.title, code: currentCode, category: section.category };
      const patch = applyControl(editable, control, device, step.value);
      const nextCode = patch?.code ?? currentCode;

      let targetEl: HTMLElement | null = null;
      if (control.target.kind === "elements" && control.target.paths[0]) {
        const parts = splitSectionCode(nextCode);
        const root = parseHtml(parts.bodyHtml);
        const node = resolvePath(root, control.target.paths[0]);
        const key = node ? getAttribute(node, ELEMENT_KEY_ATTR) : null;
        if (key) {
          const sectionEl = document.querySelector<HTMLElement>(`[data-xite-section="${cssEscape(section.id)}"]`);
          targetEl = sectionEl?.querySelector<HTMLElement>(`[${ELEMENT_KEY_ATTR}="${cssEscape(key)}"]`) ?? null;
        }
      }

      if (!targetEl) {
        results.push({ control: `${step.group} — ${step.name}`, action: step.action, expected: step.expectedLabel, actual: "target element not found on canvas", status: "FAIL" });
        if (patch) onPatch(patch);
        currentCode = nextCode;
        setReport([...results]);
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      const before = getComputedStyle(targetEl).getPropertyValue(step.cssProp);
      if (patch) onPatch(patch);
      currentCode = nextCode;
      showFlash(`RUN: ${step.group} · ${step.name}`, true);

      const after = await waitFor(
        () => getComputedStyle(targetEl!).getPropertyValue(step.cssProp),
        (value) => evaluate(step.check, before, value),
      );
      const pass = evaluate(step.check, before, after);

      results.push({
        control: `${step.group} — ${step.name}`,
        action: step.action,
        expected: step.expectedLabel,
        actual: after || "(empty)",
        status: pass ? "PASS" : "FAIL",
      });
      setReport([...results]);
      showFlash(pass ? "PASS: State Updated" : "FAIL: No visible change", pass);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    console.table(
      results.map((r) => ({
        "Control Name": r.control,
        Action: r.action,
        "Expected CSS": r.expected,
        "Actual Computed CSS": r.actual,
        Status: r.status,
      })),
    );
    setRunning(false);
  }, [running, section, device, onPatch, showFlash]);

  const passCount = report.filter((r) => r.status === "PASS").length;
  const failCount = report.filter((r) => r.status === "FAIL").length;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900/95 p-3 font-mono text-xs text-slate-200 shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold uppercase tracking-wider text-slate-400">Toolbar Diagnostics</span>
        {flash && (
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              flash.ok ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}
          >
            {flash.label}
          </span>
        )}
      </div>

      <div className="mb-2 truncate text-slate-300">
        Target: <span className="text-blue-400">{targetLabel(selectedCanvasElement, section.id)}</span>
      </div>

      <dl className="mb-3 space-y-0.5">
        {WATCHED_PROPS.map((prop) => (
          <div key={prop} className="flex items-center justify-between gap-2">
            <dt className="text-slate-500">{prop}</dt>
            <dd className="truncate text-right text-slate-200" title={watch[prop]}>
              {watch[prop] || "—"}
            </dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={runDiagnostics}
        disabled={running}
        className="mb-2 w-full rounded bg-blue-600 px-2 py-1.5 text-[11px] font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {running ? "Running Diagnostics…" : "Run Diagnostics"}
      </button>

      {report.length > 0 && (
        <div className="max-h-40 overflow-auto rounded border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/60 px-2 py-1 text-[10px]">
            <span className="text-emerald-400">{passCount} pass</span>
            <span className="text-rose-400">{failCount} fail</span>
          </div>
          {report.map((r, idx) => (
            <div
              key={`${r.control}-${idx}`}
              className="flex items-center justify-between gap-2 border-b border-slate-800/60 px-2 py-1 last:border-b-0"
            >
              <span className="truncate text-slate-300" title={r.control}>
                {r.control}
              </span>
              <span className={`font-bold ${r.status === "PASS" ? "text-emerald-400" : "text-rose-400"}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
