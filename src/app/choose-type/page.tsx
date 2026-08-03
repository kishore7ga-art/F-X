import { Sparkles } from "lucide-react";
import { ChooseTypeForm } from "@/components/choose-type/ChooseTypeForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Choose Your College Type — XITE" };

export default function ChooseTypePage() {
  return (
    <main className="min-h-screen w-full bg-black text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Contours & Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl text-center space-y-4 mb-10">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-blue-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Step 1 of 1 — Institution Profile</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Choose Your College Type
        </h1>

        <p className="text-sm sm:text-base font-medium text-slate-400 max-w-xl mx-auto leading-relaxed">
          Select the category that best describes your institution to personalize your platform features and workspace.
        </p>
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-3xl">
        <ChooseTypeForm />
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 mt-12 text-center text-xs font-medium text-slate-500">
        &copy; 2026 XITE SaaS Platform • Secure Institutional Control
      </div>
    </main>
  );
}
