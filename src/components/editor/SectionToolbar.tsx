"use client";

/**
 * The toolbar for whichever section is selected — replacing the dock in
 * place, not floating beside it.
 *
 * ── Where it lives, and why it is not a side panel or a popup ──────────────
 *
 * It was a permanent right-hand sidebar once, then a floating popup opened by
 * a dock button, and both were wrong for the same underlying reason: a panel
 * that competes with the canvas, or that hides what selecting a section
 * actually offers behind an extra click, is a panel in the way of the one
 * thing this editor is for.
 *
 * So it *is* the dock, once a section is selected — not a second surface next
 * to it. The instant something is selected, this replaces the normal icon row
 * at the same edge the dock was docked to; deselecting brings the icon row
 * back. What used to be sixty-odd controls floating in their own 340px card
 * are now grouped behind tabs (Buttons, Layout, Background, Shadow,
 * Animation, …) in a panel docked flush to that same edge, tall enough to
 * hold real fields rather than a fixed popup width.
 *
 * Only the handful of actions that matter mid-edit travel with it — back,
 * device, undo/redo, delete, save. Add Section / Duplicate / Swap Variant /
 * Move Up / Move Down stay on the normal dock; reaching them is one Escape or
 * back-tap away, and folding every dock action into this panel too would
 * mean rebuilding the whole dock a second time for no real gain during the
 * moment somebody is actually adjusting a section's styling.
 *
 * ── Why it holds almost no state ───────────────────────────────────────────
 *
 * Three pieces: which group's tab is active, which lists/items inside that
 * group are expanded, and the text currently being typed. Everything else is
 * read from `section.code` on every render, through `readControlValues`. So
 * there is no cache to invalidate, no way for the panel to disagree with the
 * canvas, and an undo — which replaces `section.code` — moves every control
 * back without the panel being told anything happened.
 *
 * The typing buffer exists because a controlled input whose value is re-derived
 * from re-parsed HTML cannot be typed into: each keystroke would rewrite the
 * markup, re-run the parser and hand the input back a normalised string with
 * the caret at the end. Drafts are held for as long as the field has focus, and
 * a change is committed 300ms after the last keystroke — the same debounce, and
 * for the same reason, as the canvas's inline text editor.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Eye,
  Layers,
  Monitor,
  Plus,
  Redo2,
  RotateCcw,
  Smartphone,
  Tablet,
  Trash2,
  ArrowUp,
  ArrowDown,
  Undo2,
  Sparkles,
} from "lucide-react";

import {
  applyControl,
  applyListAction,
  controlValueKey,
  formatNumberValue,
  hasManagedStyling,
  hexFromValue,
  numberFromValue,
  readControlValues,
  resetSectionStyling,
  type BoxValue,
  type ControlReading,
  type ControlValue,
  type EditableSection,
  type SectionPatch,
} from "@/lib/sections/section-edit";
import { buildSectionSchema, allControls, type Control, type ControlList } from "@/lib/sections/section-schema";
import { DEVICES, isUsableImageUrl, type Device } from "@/lib/sections/section-managed-css";
import type { SectionCategory } from "@/lib/sections/section-capabilities";
import type { SaveStatus } from "@/hooks/useEditorPages";
import { BoundedDimensionControl } from "./BoundedDimensionControl";
import { SingleRowButtonPanel } from "./ButtonSettingsControl";
import { SingleRowBackgroundPanel } from "./BackgroundSettingsControl";

type Props = {
  section: { id: string; title: string; code: string; category: string };
  /** Human position, for the header line. */
  position: { index: number; total: number };
  device: Device;
  /** Which edge the dock normally sits on — this panel takes its place there. */
  dockPosition?: "bottom" | "top" | "left" | "right";
  selectedCanvasElement?: HTMLElement | null;
  onDeviceChange: (device: Device) => void;
  /** Writes through the editor's own mutation path — undo, autosave and all. */
  onPatch: (patch: SectionPatch) => void;
  /** Deselects, which is what closing this panel means now that it replaces the dock. */
  onClose: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onDeleteSection?: () => void;
  saveStatus?: SaveStatus;
  saveError?: string | null;
  isOverlaid?: boolean;
  onToggleOverlay?: () => void;
};

const DEVICE_META: Record<Device, { label: string; Icon: typeof Monitor }> = {
  desktop: { label: "Desktop", Icon: Monitor },
  tablet: { label: "Tablet", Icon: Tablet },
  mobile: { label: "Mobile", Icon: Smartphone },
};

/** Width for vertical side docks. */
const PANEL_WIDTH = "320px";

/** Fixed positioning for whichever edge the dock is on — hugs content tightly with zero excess height. */
function dockedStyle(dock: "bottom" | "top" | "left" | "right"): React.CSSProperties {
  switch (dock) {
    case "top":
      return { top: 0, left: 0, right: 0 };
    case "left":
      return { left: 0, top: 0, bottom: 0, width: PANEL_WIDTH };
    case "right":
      return { right: 0, top: 0, bottom: 0, width: PANEL_WIDTH };
    default:
      return { bottom: 0, left: 0, right: 0 };
  }
}

const SAVE_STATUS_META: Record<SaveStatus, { color: string; text: string }> = {
  saving: { color: "#f59e0b", text: "Saving…" },
  saved: { color: "#16a34a", text: "Saved" },
  failed: { color: "#e11d48", text: "Not saved" },
  idle: { color: "#94a3b8", text: "No changes" },
};

function applyCanvasBackgroundDirectly(secEl: HTMLElement, controlId: string, value: ControlValue) {
  const root = (secEl.querySelector(".section-canvas-box > *") ||
                secEl.querySelector("header, section, footer, main") ||
                secEl.firstElementChild?.firstElementChild ||
                secEl) as HTMLElement;

  if (controlId === "bg-color") {
    const val = String(value || "");

    // 1. Remove background-image on root element
    root.style.removeProperty("background-image");
    root.style.backgroundImage = "none";

    // 2. Hide any <img> element used as section background
    const allImgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
    for (const img of allImgs) {
      const cls = (img.className || "").toLowerCase();
      const style = img.getAttribute("style") || "";
      const parentStyle = img.parentElement?.getAttribute("style") || "";
      const parentCls = (img.parentElement?.className || "").toLowerCase();
      if (
        cls.includes("object-cover") ||
        cls.includes("w-full") ||
        style.includes("cover") ||
        parentStyle.includes("absolute") ||
        parentCls.includes("absolute") ||
        img.hasAttribute("data-xite-bg-img")
      ) {
        img.style.display = "none";
        img.setAttribute("data-xite-bg-hidden", "true");
      }
    }

    // 3. Remove any background video container
    root.querySelector(".xite-bg-video-container")?.remove();

    // 4. Clear any inner background layers
    const innerBgs = Array.from(root.querySelectorAll<HTMLElement>(
      ".bg-layer, [class*='bg-'], [style*='background']"
    ));
    for (const innerBg of innerBgs) {
      if (innerBg !== root && !innerBg.closest("button, a, .card, [class*='card']")) {
        innerBg.style.backgroundImage = "none";
        innerBg.style.setProperty("background-color", val, "important");
      }
    }

    // 5. Apply background-color
    root.style.setProperty("background-color", val, "important");
  } else if (controlId === "bg-image") {
    const val = String(value || "").trim();
    if (isUsableImageUrl(val)) {
      const cssUrl = `url("${val}")`;
      root.style.setProperty("background-image", cssUrl, "important");
      root.style.setProperty("background-size", "cover", "important");
      root.style.setProperty("background-position", "center", "important");
      root.style.setProperty("background-repeat", "no-repeat", "important");

      // Check for <img> element used as section background and re-show it
      const allImgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
      for (const img of allImgs) {
        const cls = (img.className || "").toLowerCase();
        const style = img.getAttribute("style") || "";
        const parentStyle = img.parentElement?.getAttribute("style") || "";
        const parentCls = (img.parentElement?.className || "").toLowerCase();
        if (
          cls.includes("object-cover") ||
          cls.includes("w-full") ||
          style.includes("cover") ||
          parentStyle.includes("absolute") ||
          parentCls.includes("absolute") ||
          img.hasAttribute("data-xite-bg-img")
        ) {
          img.style.display = "";
          img.removeAttribute("data-xite-bg-hidden");
          img.src = val;
          break;
        }
      }

      // Check for inner background container
      const innerBg = root.querySelector<HTMLElement>(
        "[style*='background-image'], [style*='background:'], [class*='bg-cover']"
      );
      if (innerBg && innerBg !== root && !innerBg.closest("button, a, .card, [class*='card']")) {
        innerBg.style.setProperty("background-image", cssUrl, "important");
        innerBg.style.setProperty("background-size", "cover", "important");
        innerBg.style.setProperty("background-position", "center", "important");
      }
    } else {
      root.style.removeProperty("background-image");
      root.style.backgroundImage = "none";
    }
  } else if (controlId === "bg-video") {
    const val = String(value || "").trim();
    const existingVideo = root.querySelector<HTMLVideoElement>(".xite-bg-video-container video, video.xite-bg-video");
    if (existingVideo) {
      if (val) {
        existingVideo.src = val;
        existingVideo.muted = true;
        existingVideo.defaultMuted = true;
        existingVideo.playsInline = true;
        existingVideo.play().catch(() => {});
      } else {
        root.querySelector(".xite-bg-video-container")?.remove();
      }
    } else if (val) {
      root.querySelector(".xite-bg-video-container")?.remove();
      const container = document.createElement("div");
      container.className = "xite-bg-video-container";
      container.style.cssText = "position: absolute; inset: 0; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; min-width: 100%; min-height: 100%; margin: 0; padding: 0; border: 0; outline: 0; grid-column: 1 / -1; grid-row: 1 / -1; grid-area: 1 / 1 / -1 / -1; flex: 0 0 auto; order: -9999; overflow: hidden; pointer-events: none; z-index: 0; box-sizing: border-box;";
      container.innerHTML = `<video src="${val}" autoplay loop muted playsinline webkit-playsinline style="position: absolute; inset: 0; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; min-width: 100%; min-height: 100%; object-fit: cover; object-position: center; pointer-events: none; margin: 0; padding: 0; border: 0;"></video><div style="position: absolute; inset: 0; background: rgba(0,0,0,0.35);"></div>`;
      if (getComputedStyle(root).position === "static") {
        root.style.position = "relative";
      }
      root.insertBefore(container, root.firstChild);
      const vid = container.querySelector("video");
      if (vid) {
        vid.muted = true;
        vid.defaultMuted = true;
        vid.playsInline = true;
        vid.play().catch(() => {});
      }
    }
  } else if (controlId === "bg-shadow" || controlId === "bg-image-shadow" || controlId === "shadow" || controlId === "box-shadow") {
    const val = String(value || "").trim();
    const canvasBox = secEl.querySelector(".section-canvas-box") as HTMLElement | null;
    if (val && val !== "none") {
      root.style.setProperty("box-shadow", val, "important");
      secEl.style.setProperty("box-shadow", val, "important");
      if (canvasBox) canvasBox.style.setProperty("box-shadow", val, "important");
    } else {
      root.style.removeProperty("box-shadow");
      secEl.style.removeProperty("box-shadow");
      if (canvasBox) canvasBox.style.removeProperty("box-shadow");
    }
  } else if (controlId === "bg-image-density" || controlId === "bg-density") {
    root.style.setProperty("background-size", String(value || "cover"), "important");
  } else if (controlId === "bg-image-blur" || controlId === "bg-blur") {
    root.style.setProperty("filter", value && value !== "0px" ? `blur(${value})` : "none", "important");
  }
}

export function SectionToolbar({
  section,
  position,
  device,
  dockPosition = "bottom",
  selectedCanvasElement = null,
  onDeviceChange,
  onPatch,
  onClose,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onDeleteSection,
  saveStatus = "idle",
  saveError = null,
  isOverlaid = false,
  onToggleOverlay,
}: Props) {
  const editable: EditableSection = useMemo(
    () => ({ title: section.title, code: section.code, category: section.category }),
    [section.title, section.code, section.category],
  );

  const schema = useMemo(
    () => buildSectionSchema({ code: section.code, category: section.category as SectionCategory }),
    [section.code, section.category],
  );

  // Discover buttons in the section
  const buttonsGroup = schema.groups.find((g) => g.id === "buttons");
  const buttonIndices = useMemo(() => {
    if (!buttonsGroup) return [];
    const set = new Set<number>();
    buttonsGroup.controls.forEach((c) => {
      const m = c.id.match(/^btn-(\d+)-/);
      if (m) set.add(parseInt(m[1], 10));
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [buttonsGroup]);

  const buttonCount = buttonIndices.length;
  const [activeButtonIndex, setActiveButtonIndex] = useState<number>(0);

  const readings = useMemo(
    () => readControlValues(editable, allControls(schema), device),
    [editable, schema, device],
  );

  /** Whether Reset has anything to do. One parse, not one per render. */
  const canReset = useMemo(() => hasManagedStyling(section.code), [section.code]);

  const [activeGroupId, setActiveGroupId] = useState<string | undefined>(
    () => schema.groups.find((group) => group.open)?.id ?? schema.groups[0]?.id,
  );
  const activeGroup = schema.groups.find((group) => group.id === activeGroupId) ?? schema.groups[0];

  // If user selected a button on canvas, dynamically target it and open Buttons tab
  useEffect(() => {
    if (!selectedCanvasElement || buttonCount === 0) return;
    const btnNode = selectedCanvasElement.closest("a, button");
    if (!btnNode) return;

    const secEl = btnNode.closest("[data-xite-section]");
    if (!secEl) return;
    const allBtns = Array.from(secEl.querySelectorAll("a, button")).filter((el) => {
      const cls = el.className || "";
      return (
        el.tagName === "BUTTON" ||
        /btn|button|cta|apply|action/i.test(cls) ||
        (el as HTMLElement).style.borderRadius ||
        (el as HTMLElement).style.backgroundColor
      );
    });

    const foundIdx = allBtns.indexOf(btnNode as any);
    if (foundIdx >= 0 && foundIdx < buttonCount) {
      setActiveButtonIndex(foundIdx);
      setActiveGroupId("buttons");
    }
  }, [selectedCanvasElement, buttonCount]);

  const activeButtonControls = useMemo(() => {
    if (!buttonsGroup || buttonCount === 0) return null;
    const safeIdx = Math.min(activeButtonIndex, buttonCount - 1);
    const prefix = `btn-${safeIdx}`;
    return {
      bg: buttonsGroup.controls.find((c) => c.id === `${prefix}-bg`),
      radius: buttonsGroup.controls.find((c) => c.id === `${prefix}-radius`),
      size: buttonsGroup.controls.find((c) => c.id === `${prefix}-size`),
      textColor: buttonsGroup.controls.find((c) => c.id === `${prefix}-color`),
    };
  }, [buttonsGroup, buttonCount, activeButtonIndex]);

  const backgroundGroup = useMemo(
    () => schema.groups.find((g) => g.id === "background"),
    [schema.groups],
  );

  const activeBackgroundControls = useMemo(() => {
    if (!backgroundGroup) return null;
    return {
      color: backgroundGroup.controls.find((c) => c.id === "bg-color"),
      image: backgroundGroup.controls.find((c) => c.id === "bg-image"),
      gradient: backgroundGroup.controls.find((c) => c.id === "bg-gradient"),
      shadow: backgroundGroup.controls.find((c) => c.id === "bg-shadow"),
      density: backgroundGroup.controls.find((c) => c.id === "bg-density"),
      blur: backgroundGroup.controls.find((c) => c.id === "bg-blur"),
      video: backgroundGroup.controls.find((c) => c.id === "bg-video"),
    };
  }, [backgroundGroup]);

  const [openLists, setOpenLists] = useState<Set<string>>(
    () => new Set(schema.groups.flatMap((group) => group.lists.slice(0, 1)).map((list) => list.id)),
  );
  const [openItems, setOpenItems] = useState<Set<string>>(() => new Set());

  const toggle = (set: Set<string>, apply: (next: Set<string>) => void) => (id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    apply(next);
  };

  /* The typing buffer. Keyed the same way readings are. */
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  /**
   * The section as of the last render, for the debounced commits.
   *
   * A timer scheduled 300ms ago closed over the section as it was 300ms ago,
   * and applying an edit to *that* would discard anything committed in
   * between — a colour picked while a caption was being typed, say. The write
   * has to start from the current markup, and a ref updated after render is how
   * a callback that outlives its render reads it.
   */
  const latest = useRef(editable);
  latest.current = editable;
  useEffect(() => {
    latest.current = editable;
  }, [editable]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      Object.values(pending).forEach(clearTimeout);
    };
  }, []);

  const commit = useCallback(
    (control: Control, value: ControlValue) => {
      // Instant visual reflection on canvas element
      try {
        const secEl = document.querySelector(`[data-xite-section="${section.id}"]`) as HTMLElement | null;
        if (secEl) {
          applyCanvasBackgroundDirectly(secEl, control.id, value);
        }
      } catch {}

      const patch = applyControl(latest.current, control, device, value);
      if (patch) onPatch(patch);
    },
    [device, onPatch, section.id],
  );

  /**
   * A keystroke, held and then committed.
   *
   * The draft is dropped in the same update as the commit, so the field goes
   * back to reading the section — which by then holds what was typed. Keeping
   * the draft until a later render matched it would be the same thing with an
   * extra frame of divergence in it, and dropping it earlier would put the
   * caret at the end of the field on every keystroke.
   */
  const commitDebounced = useCallback(
    (control: Control, value: string, delay = 300) => {
      try {
        const secEl = document.querySelector(`[data-xite-section="${section.id}"]`) as HTMLElement | null;
        if (secEl) {
          applyCanvasBackgroundDirectly(secEl, control.id, value);
        }
      } catch {}

      const key = controlValueKey(control);
      setDrafts((current) => ({ ...current, [key]: value }));
      clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(() => {
        commit(control, value);
        setDrafts((current) => {
          if (!(key in current)) return current;
          const next = { ...current };
          delete next[key];
          return next;
        });
      }, delay);
    },
    [commit, section.id],
  );

  const valueOf = (control: Control): ControlReading =>
    readings.get(controlValueKey(control)) ?? { value: "", source: "none", from: null };

  const displayValue = (control: Control): string => {
    const key = controlValueKey(control);
    if (key in drafts) return drafts[key]!;
    const raw = valueOf(control).value;
    return typeof raw === "string" ? raw : "";
  };

  const runListAction = (list: ControlList, index: number, action: Parameters<typeof applyListAction>[3]) => {
    const patch = applyListAction(editable, list, index, action);
    if (patch) onPatch(patch);
  };

  const reset = () => {
    const patch = resetSectionStyling(editable);
    if (patch) onPatch(patch);
  };

  const saveMeta = SAVE_STATUS_META[saveStatus];
  const isHorizontal = dockPosition === "top" || dockPosition === "bottom";

  return (
    <div
      role="dialog"
      aria-label={`${schema.categoryLabel} section settings`}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      className={`fixed z-[99999] flex flex-col overflow-hidden bg-white/95 backdrop-blur-md transition-all ${
        dockPosition === "top"
          ? "border-b border-slate-200/90 shadow-md"
          : dockPosition === "bottom"
          ? "border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(15,23,42,0.12)]"
          : "border border-slate-200 shadow-xl"
      }`}
      style={dockedStyle(dockPosition)}
    >
      {/* ── Header: the handful of actions that matter mid-edit ─────────── */}
      <header className="flex shrink-0 items-center justify-between gap-2.5 border-b border-slate-200/80 px-3 py-1.5 bg-white">
        {/* Left: Back + Category + Title + Divider + Embedded Group Tabs */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onClose}
            title="Back to the toolbar (Esc)"
            aria-label="Deselect and return to the toolbar"
            className="flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-cyan-700 border border-cyan-200/60">
              {schema.categoryLabel}
            </span>
            <h2 className="truncate text-[11px] font-bold text-slate-700 max-w-[130px] sm:max-w-[180px]" title={section.title}>
              {section.title}
            </h2>
            <span className="text-[10px] font-semibold text-slate-400">
              {position.index + 1}/{position.total}
            </span>
          </div>

          {/* Embedded Group Tabs in horizontal mode */}
          {isHorizontal && schema.groups.length > 0 && (
            <>
              <div className="h-4 w-px bg-slate-200 shrink-0 hidden md:block" />
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
                {schema.groups.map((group) => {
                  const active = group.id === activeGroup?.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setActiveGroupId(group.id)}
                      aria-pressed={active}
                      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-0.5 text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                        active
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {group.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Devices + Actions + Reset + Save Status */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Device switcher */}
          <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 border border-slate-200/60">
            {DEVICES.map((id) => {
              const { label, Icon } = DEVICE_META[id];
              const active = device === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onDeviceChange(id)}
                  aria-pressed={active}
                  title={label}
                  className={`flex items-center justify-center rounded-md p-1 transition cursor-pointer ${
                    active ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={onUndo}
            disabled={!onUndo || !canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className={`rounded-lg p-1 transition ${canUndo ? "text-slate-600 hover:bg-slate-100 cursor-pointer" : "cursor-not-allowed text-slate-300"}`}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!onRedo || !canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            className={`rounded-lg p-1 transition ${canRedo ? "text-slate-600 hover:bg-slate-100 cursor-pointer" : "cursor-not-allowed text-slate-300"}`}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          {/* Delete Section */}
          {onDeleteSection && (
            <button
              type="button"
              onClick={onDeleteSection}
              title="Delete this section"
              aria-label="Delete this section"
              className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Overlay on Hero toggle button */}
          {(section.category === "navbar" || position.index === 0) && onToggleOverlay && (
            <button
              type="button"
              onClick={onToggleOverlay}
              title={isOverlaid ? "Detach header from hero" : "Overlay header on hero"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold transition shadow-xs cursor-pointer ${
                isOverlaid
                  ? "bg-cyan-600 text-white hover:bg-cyan-500"
                  : "bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200"
              }`}
            >
              <Layers className="h-3 w-3" />
              <span className="hidden sm:inline">{isOverlaid ? "Overlaid" : "Overlay on Hero"}</span>
            </button>
          )}

          {/* Reset styling button inside header for horizontal mode */}
          {isHorizontal && (
            <button
              type="button"
              onClick={reset}
              disabled={!canReset}
              title={
                canReset
                  ? "Remove every style this toolbar has applied to this section. Text edits are not affected."
                  : "This section has no toolbar styling to reset"
              }
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-bold transition cursor-pointer ${
                canReset
                  ? "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  : "cursor-not-allowed text-slate-300"
              }`}
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}

          {/* Save Status */}
          <span
            role="status"
            title={saveStatus === "failed" && saveError ? saveError : undefined}
            className="ml-1 whitespace-nowrap text-[10px] font-bold"
            style={{ color: saveMeta.color }}
          >
            {saveMeta.text}
          </span>
        </div>
      </header>

      {/* ── Vertical Group tabs (only when docked to left or right sidebar) ── */}
      {!isHorizontal && schema.groups.length > 0 && (
        <div className="flex shrink-0 items-center justify-center gap-1.5 overflow-x-auto border-b border-slate-100 px-3 py-1.5 bg-slate-50/60">
          {schema.groups.map((group) => {
            const active = group.id === activeGroup?.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroupId(group.id)}
                aria-pressed={active}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1 text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                  active ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900" : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Active Controls Row ───────────────────────────────────────── */}
      <div className={`overflow-x-auto ${isHorizontal ? "px-3 py-1 bg-slate-50/50" : "overflow-y-auto px-4 py-2.5 max-h-[190px]"}`}>
        {schema.groups.length === 0 && (
          <p className="text-[11px] font-medium leading-relaxed text-slate-500">
            This section&rsquo;s markup offers nothing this toolbar can edit. Its text can still be
            edited directly on the canvas.
          </p>
        )}

        {/* Dedicated Single Horizontal Row Background Panel */}
        {activeGroup?.id === "background" && activeBackgroundControls ? (
          <div className="py-0.5">
            <SingleRowBackgroundPanel
              colorValue={activeBackgroundControls.color ? displayValue(activeBackgroundControls.color) : ""}
              onDraftColor={(val) => {
                if (activeBackgroundControls.image) {
                  const imgKey = controlValueKey(activeBackgroundControls.image);
                  setDrafts((curr) => ({ ...curr, [imgKey]: "" }));
                }
                if (activeBackgroundControls.video) {
                  const vidKey = controlValueKey(activeBackgroundControls.video);
                  setDrafts((curr) => ({ ...curr, [vidKey]: "" }));
                }
                if (activeBackgroundControls.color) commitDebounced(activeBackgroundControls.color, val);
              }}
              onCommitColor={(val) => {
                if (activeBackgroundControls.image) {
                  const imgKey = controlValueKey(activeBackgroundControls.image);
                  setDrafts((curr) => ({ ...curr, [imgKey]: "" }));
                }
                if (activeBackgroundControls.video) {
                  const vidKey = controlValueKey(activeBackgroundControls.video);
                  setDrafts((curr) => ({ ...curr, [vidKey]: "" }));
                }
                if (activeBackgroundControls.color) commit(activeBackgroundControls.color, val);
              }}
              designValue={activeBackgroundControls.gradient ? displayValue(activeBackgroundControls.gradient) : ""}
              onCommitDesign={(val) => {
                if (activeBackgroundControls.gradient) commit(activeBackgroundControls.gradient, val);
              }}
              imageValue={activeBackgroundControls.image ? displayValue(activeBackgroundControls.image) : ""}
              onDraftImage={(val) => {
                if (activeBackgroundControls.image) commitDebounced(activeBackgroundControls.image, val);
              }}
              onCommitImage={(val) => {
                if (activeBackgroundControls.image) commit(activeBackgroundControls.image, val);
              }}
              shadowValue={activeBackgroundControls.shadow ? displayValue(activeBackgroundControls.shadow) : ""}
              onCommitShadow={(val) => {
                if (activeBackgroundControls.shadow) commit(activeBackgroundControls.shadow, val);
              }}
              densityValue={activeBackgroundControls.density ? displayValue(activeBackgroundControls.density) : ""}
              onCommitDensity={(val) => {
                if (activeBackgroundControls.density) commit(activeBackgroundControls.density, val);
              }}
              blurValue={activeBackgroundControls.blur ? displayValue(activeBackgroundControls.blur) : ""}
              onCommitBlur={(val) => {
                if (activeBackgroundControls.blur) commit(activeBackgroundControls.blur, val);
              }}
              videoValue={activeBackgroundControls.video ? displayValue(activeBackgroundControls.video) : ""}
              onDraftVideo={(val) => {
                if (activeBackgroundControls.video) commitDebounced(activeBackgroundControls.video, val, 100);
              }}
              onCommitVideo={(val) => {
                if (activeBackgroundControls.video) commit(activeBackgroundControls.video, val);
              }}
            />
          </div>
        ) : activeGroup?.id === "buttons" && activeButtonControls ? (
          <div className="py-0.5">
            <SingleRowButtonPanel
              buttonCount={buttonCount}
              activeButtonIndex={activeButtonIndex}
              onSelectButtonIndex={setActiveButtonIndex}
              bgValue={activeButtonControls.bg ? displayValue(activeButtonControls.bg) : ""}
              onDraftBg={(val) => {
                if (activeButtonControls.bg) commitDebounced(activeButtonControls.bg, val);
              }}
              onCommitBg={(val) => {
                if (activeButtonControls.bg) commit(activeButtonControls.bg, val);
              }}
              radiusValue={activeButtonControls.radius ? displayValue(activeButtonControls.radius) : ""}
              onCommitRadius={(val) => {
                if (activeButtonControls.radius) commit(activeButtonControls.radius, val);
              }}
              sizeValue={activeButtonControls.size ? displayValue(activeButtonControls.size) : ""}
              onCommitSize={(val) => {
                if (activeButtonControls.size) commit(activeButtonControls.size, val);
              }}
              textColorValue={activeButtonControls.textColor ? displayValue(activeButtonControls.textColor) : ""}
              onDraftTextColor={(val) => {
                if (activeButtonControls.textColor) commitDebounced(activeButtonControls.textColor, val);
              }}
              onCommitTextColor={(val) => {
                if (activeButtonControls.textColor) commit(activeButtonControls.textColor, val);
              }}
            />
          </div>
        ) : activeGroup ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 [grid-template-columns:repeat(auto-fill,minmax(190px,1fr))]">
            {activeGroup.id === "section" && (
              <div className="col-span-full p-2.5 bg-gradient-to-r from-cyan-50 to-indigo-50 border border-cyan-200/70 rounded-xl flex items-center justify-between gap-3 text-slate-800 mb-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span className="text-[11px] font-bold">
                    Drag and place books, logos, or transparent cutouts into this section from the <strong>Image Assets</strong> drawer tab!
                  </span>
                </div>
              </div>
            )}
            {activeGroup.controls.map((control) => (
              <ControlRow
                key={controlValueKey(control)}
                control={control}
                reading={valueOf(control)}
                draft={displayValue(control)}
                device={device}
                onDraft={(value) => commitDebounced(control, value)}
                onCommit={(value) => commit(control, value)}
              />
            ))}

            {activeGroup.lists.map((list) => (
              <div key={list.id} className="col-span-full">
                <ListBlock
                  list={list}
                  expanded={openLists.has(list.id)}
                  onToggle={() => toggle(openLists, setOpenLists)(list.id)}
                  openItems={openItems}
                  onToggleItem={toggle(openItems, setOpenItems)}
                  device={device}
                  valueOf={valueOf}
                  displayValue={displayValue}
                  onDraft={commitDebounced}
                  onCommit={commit}
                  onAction={(index, action) => runListAction(list, index, action)}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Footer Reset: only in vertical sidebar mode */}
      {!isHorizontal && (
        <footer className="flex shrink-0 justify-end border-t border-slate-100 px-3.5 py-1.5 bg-slate-50/50">
          <button
            type="button"
            onClick={reset}
            disabled={!canReset}
            title={
              canReset
                ? "Remove every style this toolbar has applied to this section. Text edits are not affected, and this can be undone."
                : "This section has no toolbar styling to reset"
            }
            className={`flex items-center gap-1.5 text-[10px] font-bold transition cursor-pointer ${
              canReset ? "text-slate-500 hover:text-rose-600" : "cursor-not-allowed text-slate-300"
            }`}
          >
            <RotateCcw className="h-3 w-3" />
            Reset styling
          </button>
        </footer>
      )}
    </div>
  );
}

/* ── Lists ──────────────────────────────────────────────────────────────── */

function ListBlock({
  list,
  expanded,
  onToggle,
  openItems,
  onToggleItem,
  device,
  valueOf,
  displayValue,
  onDraft,
  onCommit,
  onAction,
}: {
  list: ControlList;
  expanded: boolean;
  onToggle: () => void;
  openItems: Set<string>;
  onToggleItem: (id: string) => void;
  device: Device;
  valueOf: (control: Control) => ControlReading;
  displayValue: (control: Control) => string;
  onDraft: (control: Control, value: string) => void;
  onCommit: (control: Control, value: ControlValue) => void;
  onAction: (index: number, action: Parameters<typeof applyListAction>[3]) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
          <Layers className="h-3.5 w-3.5 text-slate-400" />
          {list.label}
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-black text-slate-600">
            {list.items.length}
          </span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="space-y-1.5 px-2 pb-3">
          {list.items.map((item, index) => {
            const id = `${list.id}:${index}`;
            const open = openItems.has(id);
            return (
              <div key={id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleItem(id)}
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                    aria-expanded={open}
                  >
                    <ChevronDown
                      className={`h-3 w-3 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : "-rotate-90"}`}
                    />
                    <span className="truncate text-[11px] font-semibold text-slate-700">{item.label}</span>
                  </button>
                  <IconAction
                    label={`Move ${list.itemNoun} up`}
                    Icon={ArrowUp}
                    disabled={index === 0}
                    onClick={() => onAction(index, "moveUp")}
                  />
                  <IconAction
                    label={`Move ${list.itemNoun} down`}
                    Icon={ArrowDown}
                    disabled={index === list.items.length - 1}
                    onClick={() => onAction(index, "moveDown")}
                  />
                  <IconAction
                    label={`Duplicate ${list.itemNoun}`}
                    Icon={Copy}
                    onClick={() => onAction(index, "duplicate")}
                  />
                  <IconAction
                    label={`Delete ${list.itemNoun}`}
                    Icon={Trash2}
                    danger
                    disabled={list.items.length <= 1}
                    onClick={() => onAction(index, "delete")}
                  />
                </div>

                {open && item.controls.length > 0 && (
                  <div className="space-y-2.5 border-t border-slate-100 px-3 py-3">
                    {item.controls.map((control) => (
                      <ControlRow
                        key={controlValueKey(control)}
                        control={control}
                        reading={valueOf(control)}
                        draft={displayValue(control)}
                        device={device}
                        onDraft={(value) => onDraft(control, value)}
                        onCommit={(value) => onCommit(control, value)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {list.actions.includes("add") && (
            <button
              type="button"
              onClick={() => onAction(list.items.length - 1, "add")}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-[11px] font-bold text-slate-500 transition hover:border-cyan-400 hover:text-cyan-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add {list.itemNoun.toLowerCase()}
            </button>
          )}

          {list.itemStyleControls.length > 0 && (
            <details className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                Style all {list.items.length} {list.itemNoun.toLowerCase()}s
              </summary>
              <div className="space-y-2.5 pt-3">
                {list.itemStyleControls.map((control) => (
                  <ControlRow
                    key={controlValueKey(control)}
                    control={control}
                    reading={valueOf(control)}
                    draft={displayValue(control)}
                    device={device}
                    onDraft={(value) => onDraft(control, value)}
                    onCommit={(value) => onCommit(control, value)}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function IconAction({
  label,
  Icon,
  onClick,
  disabled = false,
  danger = false,
}: {
  label: string;
  Icon: typeof Copy;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded p-1 transition ${
        disabled
          ? "cursor-not-allowed text-slate-200"
          : danger
            ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      <Icon className="h-3 w-3" />
    </button>
  );
}

/* ── One control ────────────────────────────────────────────────────────── */

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100";

function ControlRow({
  control,
  reading,
  draft,
  device,
  onDraft,
  onCommit,
}: {
  control: Control;
  reading: ControlReading;
  draft: string;
  device: Device;
  onDraft: (value: string) => void;
  onCommit: (value: ControlValue) => void;
}) {
  /**
   * Where the value in this field came from.
   *
   * Three states worth telling apart, because they mean different things to the
   * person: this device's own value; a value inherited from a wider device,
   * which editing here will override *for this device only*; and the author's
   * own markup, which nothing has overridden yet.
   */
  // Use BoundedDimensionControl for all number/dimension inputs (height, width, gap, border-radius, etc.)
  if (control.kind === "number") {
    return (
      <BoundedDimensionControl
        label={control.label}
        value={draft}
        min={control.min}
        max={control.max}
        step={control.step}
        unit={control.unit || "px"}
        hint={control.hint}
        onDraft={onDraft}
        onCommit={onCommit}
      />
    );
  }

  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-slate-500">{control.label}</span>
      </span>
      <ControlInput control={control} reading={reading} draft={draft} onDraft={onDraft} onCommit={onCommit} />
      {control.hint && <span className="mt-1 block text-[9px] leading-snug text-slate-400">{control.hint}</span>}
    </label>
  );
}

function ControlInput({
  control,
  reading,
  draft,
  onDraft,
  onCommit,
}: {
  control: Control;
  reading: ControlReading;
  draft: string;
  onDraft: (value: string) => void;
  onCommit: (value: ControlValue) => void;
}) {
  switch (control.kind) {
    case "textarea":
      return (
        <textarea
          rows={3}
          value={draft}
          placeholder={control.placeholder}
          onChange={(event) => onDraft(event.target.value)}
          className={`${INPUT_CLASS} resize-y leading-relaxed`}
        />
      );

    case "select":
      return (
        <select
          value={control.options?.some((option) => option.value === draft) ? draft : ""}
          onChange={(event) => onCommit(event.target.value)}
          className={INPUT_CLASS}
        >
          {control.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {/* A value the section already has that is not on the list — a
              three-column grid written as `1fr 2fr`, say. Shown rather than
              silently reset to "Inherit", which would make opening the panel
              destructive. */}
          {draft && !control.options?.some((option) => option.value === draft) && (
            <option value={draft}>{draft}</option>
          )}
        </select>
      );

    case "color":
      return (
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={hexFromValue(draft, "#ffffff")}
            onChange={(event) => onDraft(event.target.value)}
            aria-label={`${control.label} colour`}
            className="h-7 w-9 shrink-0 cursor-pointer rounded-md border border-slate-200 bg-white p-0.5"
          />
          <input
            type="text"
            value={draft}
            placeholder="inherit"
            onChange={(event) => onDraft(event.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      );

    case "number": {
      const numeric = draft === "" || /^-?[\d.]+(px|rem|em|%|vh|vw)?$/.test(draft.trim());
      if (!numeric) {
        // The section has something a number field cannot represent — a
        // `clamp()`, a `calc()`. Editing it as text keeps it; replacing it with
        // a number would silently discard fluid typography the author wrote.
        return (
          <input
            type="text"
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            className={INPUT_CLASS}
          />
        );
      }
      return (
        <div className="relative">
          <input
            type="number"
            value={numberFromValue(draft)}
            min={control.min}
            max={control.max}
            step={control.step}
            placeholder="auto"
            onChange={(event) => onDraft(formatNumberValue(event.target.value, control.unit))}
            className={`${INPUT_CLASS} pr-8`}
          />
          {control.unit && (
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300">
              {control.unit}
            </span>
          )}
        </div>
      );
    }

    case "image":
      return (
        <div className="flex items-center gap-1.5">
          {draft ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={draft}
              alt=""
              className="h-7 w-9 shrink-0 rounded-md border border-slate-200 object-cover"
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).style.visibility = "hidden";
              }}
            />
          ) : (
            <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-200 text-slate-300">
              <Eye className="h-3 w-3" />
            </span>
          )}
          <input
            type="text"
            value={draft}
            placeholder={control.placeholder ?? "https://…"}
            onChange={(event) => onDraft(event.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      );

    case "toggle": {
      const hidden = Array.isArray(reading.value) ? (reading.value as Device[]) : [];
      return (
        <div className="flex items-center gap-1">
          {DEVICES.map((id) => {
            const on = hidden.includes(id);
            const { label, Icon } = DEVICE_META[id];
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                title={on ? `Showing again on ${label}` : `Hide on ${label}`}
                onClick={() =>
                  onCommit(on ? hidden.filter((entry) => entry !== id) : [...hidden, id])
                }
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-bold transition ${
                  on
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            );
          })}
        </div>
      );
    }

    case "box": {
      const box: BoxValue =
        reading.value && typeof reading.value === "object" && !Array.isArray(reading.value)
          ? (reading.value as BoxValue)
          : { top: "", right: "", bottom: "", left: "" };
      const sides = ["top", "right", "bottom", "left"] as const;
      return (
        <div className="grid grid-cols-4 gap-1">
          {sides.map((side) => (
            <div key={side} className="relative">
              <input
                type="text"
                value={box[side]}
                placeholder={side[0]!.toUpperCase()}
                aria-label={`${control.label} ${side}`}
                onChange={(event) =>
                  onCommit({ ...box, [side]: formatNumberValue(event.target.value, "px") })
                }
                className={`${INPUT_CLASS} px-1.5 text-center`}
              />
            </div>
          ))}
        </div>
      );
    }

    default:
      return (
        <input
          type="text"
          value={draft}
          placeholder={control.placeholder}
          onChange={(event) => onDraft(event.target.value)}
          className={INPUT_CLASS}
        />
      );
  }
}
