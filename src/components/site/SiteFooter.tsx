import type { Attribution } from "@/lib/sections/attributions";

export function SiteFooter({
  collegeName,
  attributions = [],
}: {
  collegeName: string;
  /** Licence credits for the sourced designs used on this page. */
  attributions?: Attribution[];
}) {
  return (
    <footer
      className="px-6 py-8 text-center text-sm text-white/70"
      style={{ backgroundColor: "var(--site-dark)" }}
    >
      <div className="mx-auto max-w-6xl">
        <p>
          © {new Date().getFullYear()} {collegeName}. All rights reserved.
        </p>

        {attributions.length > 0 ? (
          <p className="mt-2 text-xs text-white/45">
            Design credits:{" "}
            {attributions.map((attribution, index) => (
              <span key={attribution.url}>
                {index > 0 ? ", " : null}
                <a
                  href={attribution.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white/70"
                >
                  {attribution.name}
                </a>{" "}
                <a
                  href={attribution.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/70"
                >
                  ({attribution.license})
                </a>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </footer>
  );
}
