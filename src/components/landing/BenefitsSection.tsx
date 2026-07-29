"use client";

import { CheckCircle2, DollarSign, Clock, Smartphone, ShieldCheck, Sparkles } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    { icon: <CheckCircle2 className="h-6 w-6 text-emerald-400" />, title: "No Coding Required", desc: "Non-technical staff and department clerks can manage the site effortlessly." },
    { icon: <Clock className="h-6 w-6 text-blue-400" />, title: "Fast Website Creation", desc: "Launch a full multi-page NAAC compliant college website in less than 30 minutes." },
    { icon: <Sparkles className="h-6 w-6 text-purple-400" />, title: "Easy Content Updates", desc: "Update notices, admission forms, and principal messages instantly on live canvas." },
    { icon: <Smartphone className="h-6 w-6 text-cyan-400" />, title: "Professional Responsive Designs", desc: "State-of-the-art Aceternity UI designs with smooth animations and dark glass effects." },
    { icon: <DollarSign className="h-6 w-6 text-amber-400" />, title: "Lower Dev & Maintenance Costs", desc: "Save up to 80% on web agency retainer contracts and emergency fix invoices." },
    { icon: <ShieldCheck className="h-6 w-6 text-rose-400" />, title: "Full Admin Control", desc: "Complete ownership over content, pages, themes, and domain configuration." },
  ];

  return (
    <section className="w-full bg-neutral-950 py-24 border-t border-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
            Why Choose XITE
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Key Benefits for Institution Leadership
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-xl transition hover:border-emerald-500/50"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700">
                {b.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
