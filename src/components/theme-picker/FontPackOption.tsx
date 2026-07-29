export type FontOption = {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
};

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
      className={`w-full rounded-xl border-2 p-3.5 text-left transition-all duration-200 cursor-pointer ${
        selected
          ? "border-black bg-black/[0.03] shadow-sm"
          : "border-neutral-200 hover:border-neutral-400 bg-white"
      }`}
    >
      <span
        className="block text-lg font-bold leading-snug text-neutral-900"
        style={{ fontFamily: `'${font.headingFont}', Georgia, serif` }}
      >
        {font.headingFont}
      </span>
      <span
        className="block text-xs text-neutral-600 mt-0.5"
        style={{ fontFamily: `'${font.bodyFont}', system-ui, sans-serif` }}
      >
        {font.bodyFont} — body text sample
      </span>
      <span className="mt-2.5 block text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
        {font.name}
      </span>
    </button>
  );
}
