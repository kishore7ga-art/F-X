export type DeviceMode = "desktop" | "mobile";

export const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "100%",
  mobile: "390px",
};

export function DeviceToggle({
  value,
  onChange,
}: {
  value: DeviceMode;
  onChange: (mode: DeviceMode) => void;
}) {
  const options: { mode: DeviceMode; label: string }[] = [
    { mode: "desktop", label: "Desktop" },
    { mode: "mobile", label: "Mobile" },
  ];

  return (
    <div
      className="inline-flex rounded-lg bg-black/5 p-1"
      role="group"
      aria-label="Preview size"
    >
      {options.map((option) => (
        <button
          key={option.mode}
          type="button"
          onClick={() => onChange(option.mode)}
          aria-pressed={value === option.mode}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            value === option.mode
              ? "bg-white text-black shadow-sm"
              : "text-black/55 hover:text-black"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
