/**
 * Plain <img> wrapper. Section images are arbitrary college-supplied URLs, so
 * next/image's remote-pattern allowlist isn't a fit. Centralised here so the
 * lint exception lives in exactly one place.
 */
type SiteImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export function SiteImage({ src, alt, className }: SiteImageProps) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}
