"use client";

import { Layout, Sliders, PlusCircle, Eye, Rocket } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: <Layout className="h-5 w-5 text-blue-400" />,
      title: "Select a Template",
      desc: "Choose an academic design layout tailored for engineering, medical, or arts institutes.",
    },
    {
      num: "02",
      icon: <Sliders className="h-5 w-5 text-purple-400" />,
      title: "Customize Visual Editor",
      desc: "Open the right property panel to customize colors, font pairings, and section ordering.",
    },
    {
      num: "03",
      icon: <PlusCircle className="h-5 w-5 text-pink-400" />,
      title: "Add Sections & Media",
      desc: "Insert Hero banners, Course grids, Faculty rosters, Timelines, and PDF document links.",
    },
    {
      num: "04",
      icon: <Eye className="h-5 w-5 text-emerald-400" />,
      title: "Preview In Real Time",
      desc: "Test desktop, tablet, and mobile phone previews with instant live canvas synchronization.",
    },
    {
      num: "05",
      icon: <Rocket className="h-5 w-5 text-amber-400" />,
      title: "Publish With 1 Click",
      desc: "Deploy your site instantly to custom domain with SSL encryption enabled automatically.",
    },
  ];

  return (
    <section className="w-full bg-black py-24 border-t border-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-3">
            Simple 5-Step Process
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            How XITE Works
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 backdrop-blur-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-neutral-600">
                    {step.num}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
