import type { PaletteColors } from "@/lib/theme/theme";

export type PaletteOption = {
  id: string;
  name: string;
  colors: PaletteColors;
};

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
      className={`w-full rounded-xl border-2 p-3 text-left transition-all duration-200 cursor-pointer ${
        selected
          ? "border-black bg-black/[0.03] shadow-sm"
          : "border-neutral-200 hover:border-neutral-400 bg-white"
      }`}
    >
      <div className="flex gap-1.5">
        {swatches.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className="h-8 flex-1 rounded-md shadow-inner transition-transform"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="mt-2.5 block text-xs font-bold text-neutral-800">
        {palette.name}
      </span>
    </button>
  );
}
