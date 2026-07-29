"use client";

import { Code2, Cpu, Database, Server, ShieldCheck, Zap } from "lucide-react";

export default function TechStackSection() {
  const stack = [
    { icon: <Code2 className="h-5 w-5 text-blue-400" />, title: "React 19 & TypeScript", desc: "Type-safe component system with zero runtime type errors." },
    { icon: <Cpu className="h-5 w-5 text-cyan-400" />, title: "Next.js 16 App Router", desc: "Turbopack powered SSR with sub-second page loads." },
    { icon: <Zap className="h-5 w-5 text-purple-400" />, title: "Tailwind CSS v4.0", desc: "Utility-first design engine with HSL theme token isolation." },
    { icon: <Database className="h-5 w-5 text-emerald-400" />, title: "PostgreSQL & Prisma ORM", desc: "Institutional grade relational database with JSONB content columns." },
    { icon: <Server className="h-5 w-5 text-amber-400" />, title: "Cloud CDN Asset Pipeline", desc: "Automatic webp image compression & global asset caching." },
    { icon: <ShieldCheck className="h-5 w-5 text-rose-400" />, title: "Enterprise SSL & Security", desc: "Auto-renewing HTTPS certificates & OWASP compliant admin authentication." },
  ];

  return (
    <section className="w-full bg-black py-20 border-t border-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
            Enterprise Architecture
          </p>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight">
            Powered by modern web technology stack
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4 backdrop-blur-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">{item.title}</h3>
                <p className="text-xs text-neutral-400 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
