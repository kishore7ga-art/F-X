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
    light: "bg-[var(--site-light)] text-[var(--site-dark)]",
    white: "bg-white text-[var(--site-dark)]",
    dark: "bg-[var(--site-dark)] text-white",
    primary: "bg-[var(--site-primary)] text-white",
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
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  /** `onDark` for sections rendered on a dark background, where the palette's
   * primary colour would not have enough contrast. */
  tone?: "default" | "onDark";
}) {
  return (
    <header className={align === "center" ? "text-center" : ""}>
      <h2
        className="font-[family-name:var(--site-heading-font)] text-3xl font-bold sm:text-4xl"
        style={{ color: tone === "onDark" ? "#ffffff" : "var(--site-primary)" }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-3 max-w-2xl text-base opacity-80 ${align === "center" ? "mx-auto" : ""}`}
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
