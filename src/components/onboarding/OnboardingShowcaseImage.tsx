"use client";

import { useState } from "react";

interface OnboardingShowcaseImageProps {
  hasAdminSections?: boolean;
  adminSectionsCount?: number;
}

export function OnboardingShowcaseImage({
  hasAdminSections = false,
  adminSectionsCount = 0,
}: OnboardingShowcaseImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-900 select-none">
      {/* Background Campus Photograph */}
      <img
        src="/onboarding/campus-showcase.jpg"
        alt="University Campus Experience"
        className={`h-full w-full object-cover object-center transition-opacity duration-700 ${
          imageLoaded ? "opacity-100" : "opacity-90"
        }`}
        onLoad={() => setImageLoaded(true)}
      />

      {/* Subtle vignette/editorial contrast overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Bottom Institutional Pill Tag */}
      <div className="absolute bottom-8 left-6 right-6 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md px-4 py-2 border border-white/20 text-white text-xs font-medium tracking-wide">
          <span
            className={`w-2 h-2 rounded-full ${
              hasAdminSections ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span>
            {hasAdminSections
              ? `XITE Engine • ${adminSectionsCount} Admin Section${adminSectionsCount === 1 ? "" : "s"} Configured`
              : "XITE Engine • Awaiting Admin Home Sections"}
          </span>
        </div>
      </div>
    </div>
  );
}
