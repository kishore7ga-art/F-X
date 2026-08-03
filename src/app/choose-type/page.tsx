import { Sparkles } from "lucide-react";
import Link from "next/link";
import { ChooseTypeForm } from "@/components/choose-type/ChooseTypeForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Choose Your College Type — XITE" };

export default function ChooseTypePage() {
  return (
    <main className="min-h-screen w-full bg-[#030712] text-white flex flex-col justify-between items-center p-6 relative overflow-x-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/15 blur-[160px] rounded-full pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="w-full max-w-6xl flex items-center justify-between z-20 py-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black border border-white/20 p-1 shadow-md group-hover:scale-105 transition-transform">
            <img src="/xite-logo.png" alt="XITE Logo" className="h-full w-full object-contain rounded-md" />
          </div>
          <span className="font-black text-xl tracking-tight text-white">XITE</span>
        </Link>

        <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-3.5 py-1.5 rounded-full">
          Institutional Setup
        </span>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-3xl text-center space-y-4 my-auto py-8">
        
        {/* Step Badge Pill */}
        <div className="inline-flex items-center gap-2 bg-[#091329] border border-blue-500/30 text-blue-400 text-xs font-black px-4 py-1.5 rounded-full mb-2 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Step 1 of 1 — Institution Profile</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight text-center">
          Choose Your College Type
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-neutral-400 font-medium text-center max-w-xl mx-auto leading-relaxed pb-4">
          Select the category that best describes your institution to personalize your platform features, workspace, and template designs.
        </p>

        {/* Interactive Form Component */}
        <ChooseTypeForm />
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 text-center text-xs font-mono text-neutral-500 pb-2">
        © 2026 XITE SaaS Platform • Secure Institutional Control
      </footer>
    </main>
  );
}
