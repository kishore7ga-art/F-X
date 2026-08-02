"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Sparkles, ChevronDown, Check, Layout, Palette, Type, Globe } from "lucide-react";

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
import type { TemplateSummary } from "@/lib/site/templates";
import { cn } from "@/lib/utils";

type ThemePickerProps = {
  subdomain: string;
  template: {
    id: string;
    name: string;
    description: string | null;
    demoUrl: string | null;
  };
  allTemplates?: TemplateSummary[];
  palettes: PaletteOption[];
  fonts: FontOption[];
  initialPaletteId: string;
  initialFontId: string;
};

/** Template Types / Institution Categories */
const TEMPLATE_TYPES = [
  { id: "all", name: "All Types" },
  { id: "academic", name: "Academic & University" },
  { id: "tech", name: "Engineering & Tech" },
  { id: "medical", name: "Medical & Health" },
  { id: "business", name: "Business School" },
];

export function ThemePicker({
  subdomain,
  template,
  allTemplates = [],
  palettes,
  fonts,
  initialPaletteId,
  initialFontId,
}: ThemePickerProps) {
  const router = useRouter();
  const [paletteId, setPaletteId] = useState(initialPaletteId);
  const [fontId, setFontId] = useState(initialFontId);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [selectedType, setSelectedType] = useState("all");
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selectedPalette =
    palettes.find((p) => p.id === paletteId) ?? palettes[0];
  const selectedFont = fonts.find((f) => f.id === fontId) ?? fonts[0];

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
        window.location.origin
      );
    },
    [palettes, fonts]
  );

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
    <div className="flex h-screen flex-col bg-zinc-100 font-sans">
      {/* ─── TOP HEADER BAR ─── */}
      <header className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6 py-3 shadow-xs">
        <div className="relative flex items-center gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              TEMPLATE
            </p>
            <h1 className="text-base font-bold text-neutral-900">
              {template.name}
            </h1>
          </div>
        </div>

        {/* Right Desktop/Mobile toggle buttons */}
        <DeviceToggle value={device} onChange={setDevice} />
      </header>

      {/* ─── MAIN CONTENT SPLIT LAYOUT ─── */}
      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_380px]">
        {/* Left Canvas Preview */}
        <div className="min-h-0 overflow-auto p-6 flex justify-center items-center bg-neutral-200/50">
          <div
            className="mx-auto h-full overflow-hidden rounded-2xl border border-neutral-300/80 bg-white shadow-2xl transition-[width] duration-300"
            style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%" }}
          >
            <iframe
              ref={iframeRef}
              src={`/preview/${subdomain}?template=${template.id}`}
              title={`${template.name} preview`}
              className="h-full min-h-[600px] w-full"
              onLoad={() => pushTheme(paletteId, fontId)}
            />
          </div>
        </div>

        {/* Right Sidebar Theme Controls */}
        <aside className="min-h-0 overflow-y-auto border-l border-neutral-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            {template.description && (
              <p className="text-sm leading-relaxed text-neutral-600 mb-6">
                {template.description}
              </p>
            )}

            {/* Template Type Category Selector */}
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                INSTITUTION TYPE
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-medium transition cursor-pointer",
                      selectedType === type.id
                        ? "bg-neutral-900 text-white font-semibold shadow-xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOUR PALETTE SECTION */}
            <section className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-neutral-500" />
                  COLOUR PALETTE
                </h2>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {palettes.length} Presets
                </span>
              </div>
              <div className="space-y-2.5">
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

            {/* FONT PACK SECTION */}
            <section className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-neutral-500" />
                  FONT PACK
                </h2>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {fonts.length} Typefaces
                </span>
              </div>
              <div className="space-y-2.5">
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
          </div>

          {/* BOTTOM ACTION BUTTONS AREA */}
          <div className="mt-8 pt-5 border-t border-neutral-200 space-y-3">
            {error && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleStart}
              disabled={isSaving}
              className="w-full rounded-xl bg-neutral-900 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-black active:scale-[0.99] disabled:opacity-50 shadow-md cursor-pointer"
            >
              {isSaving ? "Saving design..." : "Start with this design"}
            </button>

            {template.demoUrl && (
              <Link
                href={template.demoUrl}
                target="_blank"
                className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-bold text-neutral-800 transition hover:bg-neutral-50 hover:border-neutral-400 shadow-2xs"
              >
                View demo site
              </Link>
            )}

            <p className="pt-2 text-center text-xs text-neutral-500">
              Currently previewing{" "}
              <span className="font-bold text-neutral-800">{selectedPalette?.name}</span> +{" "}
              <span className="font-bold text-neutral-800">{selectedFont?.name}</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
