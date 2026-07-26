"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { startWithThisDesign } from "@/app/actions/design";
import {
  DeviceToggle,
  DEVICE_WIDTHS,
  type DeviceMode,
} from "@/components/theme-picker/DeviceToggle";
import {
  FontPackOption,
  type FontOption,
} from "@/components/theme-picker/FontPackOption";
import {
  PaletteSwatch,
  type PaletteOption,
} from "@/components/theme-picker/PaletteSwatch";
import {
  isPreviewMessage,
  PREVIEW_READY,
  PREVIEW_THEME,
} from "@/lib/theme/preview-message";

type ThemePickerProps = {
  collegeId: string;
  subdomain: string;
  template: {
    id: string;
    name: string;
    description: string | null;
    /** This template's own showcase site, not the visitor's. */
    demoUrl: string | null;
  };
  palettes: PaletteOption[];
  fonts: FontOption[];
  initialPaletteId: string;
  initialFontId: string;
};

/** Screen 2 — template preview with theme selection. */
export function ThemePicker({
  collegeId,
  subdomain,
  template,
  palettes,
  fonts,
  initialPaletteId,
  initialFontId,
}: ThemePickerProps) {
  const [paletteId, setPaletteId] = useState(initialPaletteId);
  const [fontId, setFontId] = useState(initialFontId);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [isSaving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selectedPalette =
    palettes.find((p) => p.id === paletteId) ?? palettes[0];
  const selectedFont = fonts.find((f) => f.id === fontId) ?? fonts[0];

  /** Push the current selection into the preview iframe. */
  const pushTheme = useCallback(
    (nextPaletteId: string, nextFontId: string) => {
      const palette = palettes.find((p) => p.id === nextPaletteId);
      const font = fonts.find((f) => f.id === nextFontId);
      if (!palette || !font) return;

      iframeRef.current?.contentWindow?.postMessage(
        {
          type: PREVIEW_THEME,
          colors: palette.colors,
          fonts: { headingFont: font.headingFont, bodyFont: font.bodyFont },
        },
        window.location.origin,
      );
    },
    [palettes, fonts],
  );

  // The iframe announces when its bridge is mounted; only then can it receive
  // theme updates. Re-sending on `onLoad` alone would race hydration.
  useEffect(() => {
    function handlePreviewMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isPreviewMessage(event.data)) return;
      if (event.data.type === PREVIEW_READY) pushTheme(paletteId, fontId);
    }

    window.addEventListener("message", handlePreviewMessage);
    return () => window.removeEventListener("message", handlePreviewMessage);
  }, [pushTheme, paletteId, fontId]);

  function selectPalette(id: string) {
    setPaletteId(id);
    pushTheme(id, fontId);
  }

  function selectFont(id: string) {
    setFontId(id);
    pushTheme(paletteId, id);
  }

  function handleStart() {
    setError(null);
    startSaving(async () => {
      try {
        await startWithThisDesign({
          templateId: template.id,
          paletteId,
          fontId,
        });
      } catch (cause) {
        // redirect() throws a control-flow error that must not be swallowed.
        if (
          cause &&
          typeof cause === "object" &&
          "digest" in cause &&
          String((cause as { digest?: unknown }).digest).startsWith("NEXT_")
        ) {
          throw cause;
        }
        setError("Could not save this design. Please try again.");
      }
    });
  }

  return (
    <div className="flex h-dvh flex-col bg-zinc-100">
      <header className="flex items-center justify-between gap-4 border-b bg-white px-5 py-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-black/45">
            Template
          </p>
          <h1 className="text-base font-bold">{template.name}</h1>
        </div>
        <DeviceToggle value={device} onChange={setDevice} />
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_360px]">
        {/* Left — live preview */}
        <div className="min-h-0 overflow-auto p-5">
          <div
            className="mx-auto h-full overflow-hidden rounded-xl border bg-white shadow-sm transition-[width] duration-300"
            style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%" }}
          >
            <iframe
              ref={iframeRef}
              // The template is named so the frame has something to show before
              // this college owns a site of its own.
              src={`/preview/${subdomain}?template=${template.id}`}
              title={`${template.name} preview`}
              className="h-full min-h-[600px] w-full"
              onLoad={() => pushTheme(paletteId, fontId)}
            />
          </div>
        </div>

        {/* Right — theme options */}
        <aside className="min-h-0 overflow-auto border-l bg-white p-5">
          {template.description ? (
            <p className="text-sm leading-relaxed text-black/60">
              {template.description}
            </p>
          ) : null}

          <section className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/45">
              Colour palette
            </h2>
            <div className="mt-3 space-y-2">
              {palettes.map((palette) => (
                <PaletteSwatch
                  key={palette.id}
                  palette={palette}
                  selected={palette.id === paletteId}
                  onSelect={() => selectPalette(palette.id)}
                />
              ))}
            </div>
          </section>

          <section className="mt-7">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/45">
              Font pack
            </h2>
            <div className="mt-3 space-y-2">
              {fonts.map((font) => (
                <FontPackOption
                  key={font.id}
                  font={font}
                  selected={font.id === fontId}
                  onSelect={() => selectFont(font.id)}
                />
              ))}
            </div>
          </section>

          <div className="mt-8 space-y-2 border-t pt-5">
            {error ? (
              <p className="text-xs font-medium text-red-600">{error}</p>
            ) : null}

            <button
              type="button"
              onClick={handleStart}
              disabled={isSaving}
              className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Start with this design"}
            </button>

            {/* The template's own showcase, not `/site/${subdomain}` — that was
                the visitor's site, which is empty at this point and 404ed. */}
            {template.demoUrl ? (
              <Link
                href={template.demoUrl}
                target="_blank"
                className="block w-full rounded-lg border px-4 py-3 text-center text-sm font-semibold transition hover:bg-black/5"
              >
                View demo site
              </Link>
            ) : null}

            <p className="pt-1 text-center text-xs text-black/45">
              Currently previewing{" "}
              <span className="font-semibold">{selectedPalette?.name}</span> +{" "}
              <span className="font-semibold">{selectedFont?.name}</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
