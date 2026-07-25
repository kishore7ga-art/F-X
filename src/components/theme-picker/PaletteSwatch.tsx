import type { PaletteColors } from "@/lib/theme/theme";

export type PaletteOption = {
  id: string;
  name: string;
  colors: PaletteColors;
};

/** One pre-made colour combination. Colleges pick a whole palette, never an
 * individual colour — that is what keeps published sites looking designed. */
export function PaletteSwatch({
  palette,
  selected,
  onSelect,
}: {
  palette: PaletteOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const swatches = [
    palette.colors.primary,
    palette.colors.secondary,
    palette.colors.accent,
    palette.colors.dark,
  ];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-lg border-2 p-3 text-left transition ${
        selected
          ? "border-black bg-black/[0.03]"
          : "border-black/10 hover:border-black/30"
      }`}
    >
      <div className="flex gap-1.5">
        {swatches.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className="h-7 flex-1 rounded"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="mt-2 block text-xs font-semibold">{palette.name}</span>
    </button>
  );
}
