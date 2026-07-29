"use client";

import { Building2, GraduationCap, School, BookOpen, Stethoscope, Briefcase } from "lucide-react";

export default function TargetUsersSection() {
  const categories = [
    { icon: <Building2 className="h-6 w-6 text-blue-400" />, title: "Engineering Colleges", desc: "Showcase NIRF rankings, NBA accredited departments, and campus placement metrics." },
    { icon: <GraduationCap className="h-6 w-6 text-purple-400" />, title: "Universities & Deemed Varsities", desc: "Multi-faculty portals with research papers, IQAC reports, and vice-chancellor messages." },
    { icon: <BookOpen className="h-6 w-6 text-emerald-400" />, title: "Arts & Science Institutions", desc: "Highlight humanities, science labs, cultural festivals, and alumni networks." },
    { icon: <School className="h-6 w-6 text-amber-400" />, title: "Polytechnics & Vocational Institutes", desc: "Diploma course listings, lab equipment specs, and industrial training workshops." },
    { icon: <Stethoscope className="h-6 w-6 text-rose-400" />, title: "Medical & Nursing Colleges", desc: "Clinical rotation schedules, hospital attachment info, and NMC compliance docs." },
    { icon: <Briefcase className="h-6 w-6 text-cyan-400" />, title: "Training Centers & Academies", desc: "Short term certificate courses, batch schedules, and online admission forms." },
  ];

  return (
    <section className="w-full bg-neutral-950 py-24 border-t border-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
            Tailored For Education
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Built specifically for educational institutions of all sizes.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 backdrop-blur-xl transition hover:border-emerald-500/50"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700">
                {cat.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
