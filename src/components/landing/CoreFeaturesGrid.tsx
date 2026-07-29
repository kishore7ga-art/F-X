"use client";

import {
  Layout,
  MousePointer,
  Eye,
  Smartphone,
  Palette,
  FileText,
  Image as ImageIcon,
  Layers,
  Globe,
  Rocket,
  Lock,
  Zap,
} from "lucide-react";

export default function CoreFeaturesGrid() {
  const features = [
    { icon: <Layout className="h-6 w-6 text-purple-400" />, name: "Academic Templates", desc: "Pre-configured design themes tailored for engineering & arts institutes." },
    { icon: <MousePointer className="h-6 w-6 text-blue-400" />, name: "Visual Drag-and-Drop", desc: "Re-arrange sections, heroes, and announcements effortlessly." },
    { icon: <Eye className="h-6 w-6 text-emerald-400" />, name: "Real-Time Live Preview", desc: "Instantly preview your edits on the live canvas on every keystroke." },
    { icon: <Smartphone className="h-6 w-6 text-cyan-400" />, name: "100% Responsive", desc: "Pixel-perfect experience across Desktop, Tablet, and Mobile devices." },
    { icon: <Palette className="h-6 w-6 text-pink-400" />, name: "Color & Font Themes", desc: "Curated academic palette swatches and Google Font pairings." },
    { icon: <FileText className="h-6 w-6 text-amber-400" />, name: "Academic CMS", desc: "Manage courses, syllabi, faculty, and notices in structured JSON." },
    { icon: <ImageIcon className="h-6 w-6 text-rose-400" />, name: "Media & Asset Manager", desc: "Drag & drop image upload zone supporting PNG, JPG, SVG, WEBP." },
    { icon: <Layers className="h-6 w-6 text-indigo-400" />, name: "Page Tree Management", desc: "Create, order, and toggle visibility of unlimited site pages." },
    { icon: <Globe className="h-6 w-6 text-teal-400" />, name: "Custom Subdomain / DNS", desc: "Publish to yourcollege.xite.edu or connect your own domain." },
    { icon: <Rocket className="h-6 w-6 text-emerald-400" />, name: "One-Click Publishing", desc: "Deploy changes to production instantly without server restarts." },
    { icon: <Lock className="h-6 w-6 text-red-400" />, name: "Secure Admin Control", desc: "Role-based access for department heads, admins, and staff." },
    { icon: <Zap className="h-6 w-6 text-amber-400" />, name: "Sub-Second Performance", desc: "Optimized Next.js server SSR with global edge CDN caching." },
  ];

  return (
    <section className="w-full bg-neutral-950 py-24 border-t border-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
            Core Platform Capabilities
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Everything your college needs to build a world-class web portal.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 backdrop-blur-xl transition-all duration-200 hover:border-blue-500/50 hover:bg-neutral-900/80"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">{feature.name}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
