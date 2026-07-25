export type FontOption = {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
};

/** One pre-made heading/body font pairing. */
export function FontPackOption({
  font,
  selected,
  onSelect,
}: {
  font: FontOption;
  selected: boolean;
  onSelect: () => void;
}) {
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
      <span
        className="block text-lg font-bold leading-tight"
        style={{ fontFamily: `'${font.headingFont}', Georgia, serif` }}
      >
        {font.headingFont}
      </span>
      <span
        className="block text-sm opacity-70"
        style={{ fontFamily: `'${font.bodyFont}', system-ui, sans-serif` }}
      >
        {font.bodyFont} — body text sample
      </span>
      <span className="mt-2 block text-xs font-semibold opacity-50">
        {font.name}
      </span>
    </button>
  );
}
