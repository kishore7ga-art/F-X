"use client";

import { useState } from "react";

/**
 * Plain <img> wrapper with fallback support for real college imagery.
 */
type SiteImageProps = {
  src: string;
  alt: string;
  className?: string;
};

const IMAGE_FALLBACKS: Record<string, string> = {
  "/seed/campus.svg": "/template-brightwood.jpg",
  "/seed/principal.svg": "/hero-madras-college.jpg",
  "/seed/faculty-1.svg": "/template-evergreen.jpg",
  "/seed/faculty-2.svg": "/template-calistoga.jpg",
  "/seed/faculty-3.svg": "/template-oakwood.jpg",
  "/seed/faculty-4.svg": "/macbook-madras-college.png",
};

export function SiteImage({ src, alt, className }: SiteImageProps) {
  const resolvedSrc = IMAGE_FALLBACKS[src] || src;
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);

  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (currentSrc !== "/template-brightwood.jpg") {
          setCurrentSrc("/template-brightwood.jpg");
        }
      }}
    />
  );
}
