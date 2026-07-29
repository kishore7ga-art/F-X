"use client";
import React from "react";
import { Timeline } from "@/components/ui/timeline";

const imgClass =
  "h-24 w-full rounded-xl object-cover shadow-2xl border border-white/10 md:h-48 lg:h-64 transition-transform duration-300 hover:scale-[1.02]";

export default function TimelineSection() {
  const data = [
    {
      title: "Select Templates",
      content: (
        <div>
          <p className="mb-6 text-sm font-normal text-neutral-300 md:text-base leading-relaxed">
            Choose from 100+ NAAC-ready college & university website templates designed specifically for higher educational institutions.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img src="/template-brightwood.jpg" alt="Brightwood University Template" className={imgClass} />
            <img src="/template-evergreen.jpg" alt="Evergreen University Template" className={imgClass} />
            <img src="/template-calistoga.jpg" alt="Calistoga University Template" className={imgClass} />
            <img src="/template-oakwood.jpg" alt="Oakwood University Template" className={imgClass} />
          </div>
        </div>
      ),
    },
    {
      title: "Visual Builder",
      content: (
        <div>
          <p className="mb-6 text-sm font-normal text-neutral-300 md:text-base leading-relaxed">
            Customize heroes, faculty rosters, news tickers, course catalogs, and admission forms with instant live canvas updates.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img src="/tab1-builder.jpg" alt="Visual Canvas & Builder" className={imgClass} />
            <img src="/tab3-preview.jpg" alt="Multi-Device Responsive Preview" className={imgClass} />
          </div>
        </div>
      ),
    },
    {
      title: "1-Click Publish",
      content: (
        <div>
          <p className="mb-6 text-sm font-normal text-neutral-300 md:text-base leading-relaxed">
            Deploy your institution&apos;s website live globally in 1 second with automatic SSL encryption and custom domain routing.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img src="/tab5-publish.jpg" alt="Instant Edge Deployment" className={imgClass} />
            <img src="/xite-editor-hero.jpg" alt="Live Published Site" className={imgClass} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="relative w-full overflow-clip bg-black">

      <Timeline data={data} />
    </section>
  );
}
