"use client";

import React from "react";
import { Tabs } from "@/components/ui/tabs";

export default function TabsSection() {
  const tabs = [
    {
      title: "Visual Builder",
      value: "builder",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-3xl p-8 sm:p-12 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 border border-white/10 shadow-2xl">
          <p className="text-white text-3xl md:text-5xl font-black">Intuitive Visual Drag-and-Drop Editor</p>
          <p className="text-base md:text-lg font-normal text-blue-200 mt-3 max-w-2xl leading-relaxed">
            Customize heroes, faculty rosters, news tickers, and course catalogs with instant real-time canvas updates.
          </p>
          <img
            src="/tab1-builder.jpg"
            alt="Visual Drag and Drop Builder"
            className="object-cover object-center h-[60%] md:h-[72%] absolute -bottom-4 inset-x-0 w-[94%] rounded-2xl mx-auto shadow-2xl border border-white/20"
          />
        </div>
      ),
    },
    {
      title: "Ready Templates",
      value: "templates",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-3xl p-8 sm:p-12 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-purple-700 via-violet-800 to-slate-950 border border-white/10 shadow-2xl">
          <p className="text-white text-3xl md:text-5xl font-black">NAAC-Ready Academic Themes</p>
          <p className="text-base md:text-lg font-normal text-purple-200 mt-3 max-w-2xl leading-relaxed">
            Select from pre-built design themes tailored specifically for universities, polytechnics, and engineering colleges.
          </p>
          <img
            src="/tab2-templates.jpg"
            alt="Ready Templates"
            className="object-cover object-center h-[60%] md:h-[72%] absolute -bottom-4 inset-x-0 w-[94%] rounded-2xl mx-auto shadow-2xl border border-white/20"
          />
        </div>
      ),
    },
    {
      title: "Live Preview",
      value: "preview",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-3xl p-8 sm:p-12 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-cyan-700 via-teal-800 to-slate-950 border border-white/10 shadow-2xl">
          <p className="text-white text-3xl md:text-5xl font-black">100% Mobile & Desktop Responsive</p>
          <p className="text-base md:text-lg font-normal text-cyan-200 mt-3 max-w-2xl leading-relaxed">
            Preview exact layout performance on smartphones, tablets, and desktop displays simultaneously.
          </p>
          <img
            src="/tab3-preview.jpg"
            alt="Live Responsive Preview"
            className="object-cover object-center h-[60%] md:h-[72%] absolute -bottom-4 inset-x-0 w-[94%] rounded-2xl mx-auto shadow-2xl border border-white/20"
          />
        </div>
      ),
    },
    {
      title: "Academic CMS",
      value: "cms",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-3xl p-8 sm:p-12 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-indigo-800 via-slate-900 to-black border border-white/10 shadow-2xl">
          <p className="text-white text-3xl md:text-5xl font-black">Structured Department & Faculty CMS</p>
          <p className="text-base md:text-lg font-normal text-indigo-200 mt-3 max-w-2xl leading-relaxed">
            Manage syllabus PDFs, faculty profiles, research publications, and notices without touching code.
          </p>
          <img
            src="/tab4-cms.jpg"
            alt="Academic CMS"
            className="object-cover object-center h-[60%] md:h-[72%] absolute -bottom-4 inset-x-0 w-[94%] rounded-2xl mx-auto shadow-2xl border border-white/20"
          />
        </div>
      ),
    },
    {
      title: "1-Click Publish",
      value: "publish",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-3xl p-8 sm:p-12 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-emerald-700 via-teal-900 to-slate-950 border border-white/10 shadow-2xl">
          <p className="text-white text-3xl md:text-5xl font-black">Instant Global Edge Publishing</p>
          <p className="text-base md:text-lg font-normal text-emerald-200 mt-3 max-w-2xl leading-relaxed">
            Deploy changes live in 1 second with automatic SSL encryption and custom college domain integration.
          </p>
          <img
            src="/tab5-publish.jpg"
            alt="1-Click Publish"
            className="object-cover object-center h-[60%] md:h-[72%] absolute -bottom-4 inset-x-0 w-[94%] rounded-2xl mx-auto shadow-2xl border border-white/20"
          />
        </div>
      ),
    },
  ];

  return (
    <section className="w-full bg-black py-28 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="text-center mb-12 px-6 max-w-4xl">
        <p className="text-blue-400 text-sm font-bold tracking-[0.3em] uppercase mb-4">
          NO-CODE WEBSITE BUILDER
        </p>
        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
          Built for{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Education
          </span>
        </h2>
        <p className="mt-4 text-base md:text-lg text-neutral-300 max-w-3xl mx-auto leading-relaxed font-medium">
          Create modern, responsive college websites with a powerful drag-and-drop builder, professionally designed templates, and one-click publishing. Everything your institution needs to build a stunning online presence.
        </p>
      </div>

      <div className="h-[34rem] md:h-[48rem] [perspective:1000px] relative flex flex-col max-w-7xl mx-auto w-full items-start justify-start px-4">
        <Tabs tabs={tabs} />
      </div>
    </section>
  );
}
