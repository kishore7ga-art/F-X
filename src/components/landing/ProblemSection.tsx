"use client";

import { AlertTriangle, DollarSign, Lock, Smartphone, Hourglass } from "lucide-react";

export default function ProblemSection() {
  const painPoints = [
    {
      icon: <AlertTriangle className="h-6 w-6 text-amber-400" />,
      title: "Outdated & Cluttered Layouts",
      desc: "Legacy college sites look like 2005 HTML pages, turning off prospective students and accreditation boards.",
    },
    {
      icon: <DollarSign className="h-6 w-6 text-red-400" />,
      title: "Expensive Agency Fees",
      desc: "Hiring web agencies costs lakhs every year for basic design updates and maintenance contracts.",
    },
    {
      icon: <Lock className="h-6 w-6 text-purple-400" />,
      title: "Dev-Dependent For Minor Edits",
      desc: "Changing a notice, syllabus PDF, or principal's message requires waiting days for developers.",
    },
    {
      icon: <Smartphone className="h-6 w-6 text-blue-400" />,
      title: "Poor Mobile Responsiveness",
      desc: "Over 80% of student traffic comes from mobile devices, yet legacy sites break on smartphones.",
    },
    {
      icon: <Hourglass className="h-6 w-6 text-rose-400" />,
      title: "Slow 6-Month Redesign Cycles",
      desc: "Redesigning a department or main portal takes months of back-and-forth approval meetings.",
    },
  ];

  return (
    <section className="w-full bg-neutral-950 py-24 border-t border-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3">
            The Industry Problem
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Many college websites are outdated, expensive, and hard to maintain.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 backdrop-blur-xl transition hover:border-neutral-700 hover:bg-neutral-900/80"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700">
                {point.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{point.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{point.desc}</p>
            </div>
          ))}

          {/* Visual Highlight Card */}
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 to-neutral-900 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider block mb-2">
                Legacy Bottleneck
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Stop wasting time & budget on legacy CMS platforms
              </h3>
              <p className="text-sm text-neutral-300">
                Transition to XITE and empower your administration to publish changes instantly.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-red-500/20 text-xs text-red-300 font-medium">
              ⚡ 10x Faster Deployment Guaranteed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
