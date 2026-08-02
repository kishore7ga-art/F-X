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

/*
 * Seed placeholders swapped for real photography.
 *
 * Only for files that exist: `/seed/principal.svg` used to be mapped to
 * `/hero-madras-college.jpg`, which is not in `public/`, so this turned a
 * working placeholder into a 404 and then fell through to the campus photo via
 * onError — a portrait slot filled with a building. The seed SVG is the better
 * answer until a college uploads its own.
 */
const IMAGE_FALLBACKS: Record<string, string> = {
  "/hero-madras-college.jpg": "/template-brightwood.jpg",
  "/madras-graduation.png": "/template-brightwood.jpg",
  "/macbook-madras-college.png": "/template-brightwood.jpg",
  "/seed/campus.svg": "/template-brightwood.jpg",
  "/seed/faculty-1.svg": "/template-evergreen.jpg",
  "/seed/faculty-2.svg": "/template-calistoga.jpg",
  "/seed/faculty-3.svg": "/template-oakwood.jpg",
  "/seed/faculty-4.svg": "/template-brightwood.jpg",
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
