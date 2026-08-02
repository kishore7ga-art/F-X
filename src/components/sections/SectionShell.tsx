import type { ReactNode } from "react";

/** Consistent vertical rhythm + max width for every section. Layout is fixed
 * per template — colleges cannot change spacing or grid, only content. */
export function SectionShell({
  children,
  className = "",
  background = "light",
}: {
  children: ReactNode;
  className?: string;
  background?: "light" | "white" | "dark" | "primary";
}) {
  const backgrounds = {
    light: "bg-[var(--site-light)] text-[var(--site-dark)] transition-colors duration-300",
    white: "bg-[var(--site-card-bg)] text-[var(--site-dark)] transition-colors duration-300",
    dark: "bg-[var(--site-dark)] text-[var(--site-light)] transition-colors duration-300",
    primary: "bg-[var(--site-primary)] text-white transition-colors duration-300",
  } as const;

  return (
    <section className={`px-6 py-16 sm:py-20 ${backgrounds[background]} ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  tone = "default",
}: {
  title?: string;
  subtitle?: string;
  align?: "left" | "center";
  /** `onDark` for sections rendered on a dark background, where the palette's
   * primary colour would not have enough contrast. */
  tone?: "default" | "onDark";
}) {
  if (!title) return null;

  return (
    <header className={align === "center" ? "text-center" : ""}>
      <h2
        className="font-[family-name:var(--site-heading-font)] text-3xl font-extrabold sm:text-4xl tracking-tight"
        style={{ color: tone === "onDark" ? "var(--site-dark)" : "var(--site-primary)" }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-3 max-w-2xl text-base font-medium opacity-85 ${align === "center" ? "mx-auto" : ""}`}
        >
          {subtitle}
        </p>
      ) : null}
      <div
        className={`mt-4 h-1 w-16 rounded ${align === "center" ? "mx-auto" : ""}`}
        style={{ backgroundColor: "var(--site-accent)" }}
      />
    </header>
  );
}
