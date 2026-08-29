"use client";

/**
 * The toolbar for whichever section is selected.
 *
 * ── Where it lives, and why it is not a side panel ─────────────────────────
 *
 * It was one, docked to the right edge for as long as a section was selected,
 * and that was wrong for this editor: it stood open the whole time, took 344px
 * off the canvas permanently, and made selecting a section a layout event. The
 * canvas is the product here; a panel that competes with it for width is a
 * panel that is in the way.
 *
 * So it is a **popup, opened from one small button in the dock**, and closed
 * again. Nothing appears until it is asked for, and the canvas is full width
 * the rest of the time. The dock keeps what belongs to the *editor* — save
 * state, device width, undo, share, add-section, and the section's own
 * move/duplicate/swap/delete — and this holds what belongs to the *section*:
 * the sixty-odd controls that could never have fitted in a 52px strip.
 *
 * It anchors to whichever edge the dock has been dragged to, so the two are
 * always adjacent and never overlapping.
 *
 * ── Why it holds almost no state ───────────────────────────────────────────
 *
 * Two pieces only: which groups are expanded, and the text currently being
 * typed. Everything else is read from `section.code` on every render, through
 * `readControlValues`. So there is no cache to invalidate, no way for the panel
 * to disagree with the canvas, and an undo — which replaces `section.code` —
 * moves every control back without the panel being told anything happened.
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
  ChevronDown,
  Copy,
  Eye,
  Layers,
  Monitor,
  Plus,
  RotateCcw,
  Smartphone,
  Tablet,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
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
import { DEVICES, type Device } from "@/lib/sections/section-managed-css";
import type { SectionCategory } from "@/lib/sections/section-capabilities";

type Props = {
  section: { id: string; title: string; code: string; category: string };
  /** Human position, for the header line. */
  position: { index: number; total: number };
  device: Device;
  /** Which edge the floating dock is on, so the popup opens against it. */
  dockPosition?: "bottom" | "top" | "left" | "right";
  onDeviceChange: (device: Device) => void;
  /** Writes through the editor's own mutation path — undo, autosave and all. */
  onPatch: (patch: SectionPatch) => void;
  /** Closes the popup. Does *not* deselect — the section stays selected. */
  onClose: () => void;
};

const DEVICE_META: Record<Device, { label: string; Icon: typeof Monitor }> = {
  desktop: { label: "Desktop", Icon: Monitor },
  tablet: { label: "Tablet", Icon: Tablet },
  mobile: { label: "Mobile", Icon: Smartphone },
};

export const SECTION_TOOLBAR_WIDTH = 340;

/** The floating dock's thickness on whichever edge it has snapped to. */
const DOCK_THICKNESS = 52;

/** A little air between the popup and the dock it opens from. */
const DOCK_GAP = 10;

/** The selected-section pill the dock draws above its bar, and its own gap. */
const PILL_HEIGHT = 34;

/**
 * Where the popup sits, given the edge the dock is on.
 *
 * Always adjacent to the dock and never over it, because the button that opens
 * this lives *in* the dock — a popup covering its own trigger is a popup you
 * cannot close by pressing the thing you opened it with.
 *
 * Horizontal docks centre it; vertical docks put it against the same side, so
 * it opens outward from the button rather than across the canvas.
 */
function popupPosition(dock: "bottom" | "top" | "left" | "right"): React.CSSProperties {
  /* A horizontal dock carries the selected-section pill above the bar, and the
     trigger button is *in* that pill — so the clearance is the bar plus the
     pill, not the bar alone. A vertical dock has no pill. */
  const alongside = DOCK_THICKNESS + DOCK_GAP;
  const overBar = DOCK_THICKNESS + PILL_HEIGHT + DOCK_GAP;
  switch (dock) {
    case "top":
      return { top: overBar, left: "50%", transform: "translateX(-50%)" };
    case "left":
      return { left: alongside, bottom: DOCK_GAP };
    case "right":
      return { right: alongside, bottom: DOCK_GAP };
    default:
      return { bottom: overBar, left: "50%", transform: "translateX(-50%)" };
  }
}

export function SectionToolbar({
  section,
  position,
  device,
  dockPosition = "bottom",
  onDeviceChange,
  onPatch,
  onClose,
}: Props) {
  const editable: EditableSection = useMemo(
    () => ({ title: section.title, code: section.code, category: section.category }),
    [section.title, section.code, section.category],
  );

  const schema = useMemo(
    () => buildSectionSchema({ code: section.code, category: section.category as SectionCategory }),
    [section.code, section.category],
  );

  const readings = useMemo(
    () => readControlValues(editable, allControls(schema), device),
    [editable, schema, device],
  );

  /** Whether Reset has anything to do. One parse, not one per render. */
  const canReset = useMemo(() => hasManagedStyling(section.code), [section.code]);

  /**
   * Which groups are expanded.
   *
   * Initialised from the schema rather than synchronised to it by an effect,
   * because `EditorStudio` renders this component with `key={section.id}`: a
   * different section is a different component instance, so "Content was open
   * on the hero" cannot leak onto the footer the person just clicked. Deriving
   * it in an effect instead would also *collapse the group being edited*, since
   * every edit rebuilds the schema.
   */
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(schema.groups.filter((group) => group.open).map((group) => group.id)),
  );
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
      const patch = applyControl(latest.current, control, device, value);
      if (patch) onPatch(patch);
    },
    [device, onPatch],
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
    [commit],
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

  return (
    <div
      role="dialog"
      aria-label={`${schema.categoryLabel} section settings`}
      onClick={(event) => event.stopPropagation()}
      className="fixed z-[100000] flex max-h-[min(70vh,560px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.22)]"
      style={{ width: SECTION_TOOLBAR_WIDTH, ...popupPosition(dockPosition) }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-slate-200 px-3.5 pb-2.5 pt-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-baseline gap-2">
            <p className="shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-600">
              {schema.categoryLabel}
            </p>
            <h2 className="truncate text-[11px] font-bold text-slate-500" title={section.title}>
              {section.title}
              <span className="ml-1.5 font-semibold text-slate-300">
                {position.index + 1}/{position.total}
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close section settings"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Device tabs. These drive the editor's real viewport, so the canvas
            and the values being edited always describe the same width — the
            alternative is a panel showing mobile values beside a desktop
            preview, which is worse than having no device tabs at all. */}
        <div className="mt-2 flex items-center gap-1 rounded-xl bg-slate-100 p-0.5">
          {DEVICES.map((id) => {
            const { label, Icon } = DEVICE_META[id];
            const active = device === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onDeviceChange(id)}
                aria-pressed={active}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                  active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>

      </header>

      {/* ── Groups ─────────────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {schema.groups.length === 0 && (
          <p className="px-4 py-6 text-[11px] font-medium leading-relaxed text-slate-500">
            This section&rsquo;s markup offers nothing this toolbar can edit. Its text can still be
            edited directly on the canvas.
          </p>
        )}

        {schema.groups.map((group) => {
          const expanded = openGroups.has(group.id);
          return (
            <section key={group.id} className="border-b border-slate-100">
              <button
                type="button"
                onClick={() => toggle(openGroups, setOpenGroups)(group.id)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <span className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-700">
                  {group.label}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </button>

              {expanded && (
                <div className="space-y-3 px-4 pb-4">
                  {group.controls.map((control) => (
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

                  {group.lists.map((list) => (
                    <ListBlock
                      key={list.id}
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
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/*
        Reset, and only Reset.

        The six-button row that used to sit here — move up, move down, swap,
        duplicate, delete — duplicated buttons the dock already has three
        centimetres away, and a control offered twice is a control someone has
        to work out the difference between. Reset is the one section action the
        dock has no equivalent for, because it belongs to the styling this
        popup writes.
      */}
      <footer className="shrink-0 border-t border-slate-100 px-3.5 py-2">
        <button
          type="button"
          onClick={reset}
          disabled={!canReset}
          title={
            canReset
              ? "Remove every style this toolbar has applied to this section. Text edits are not affected, and this can be undone."
              : "This section has no toolbar styling to reset"
          }
          className={`flex items-center gap-1.5 text-[10px] font-bold transition ${
            canReset ? "text-slate-500 hover:text-rose-600" : "cursor-not-allowed text-slate-300"
          }`}
        >
          <RotateCcw className="h-3 w-3" />
          Reset styling
        </button>
      </footer>
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
  const provenance =
    reading.source === "managed" && reading.from && reading.from !== device
      ? `From ${DEVICE_META[reading.from].label}`
      : reading.source === "authored" && String(reading.value)
        ? "From the section"
        : null;

  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-slate-500">{control.label}</span>
        {provenance && (
          <span className="shrink-0 text-[9px] font-semibold text-slate-300" title={control.hint}>
            {provenance}
          </span>
        )}
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
