import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale, CheckCircle2, AlertCircle } from "lucide-react";
import { HeaderNavbar } from "@/components/landing/HeaderNavbar";
import { CinematicFooter } from "@/components/ui/motion-footer";

export const metadata = {
  title: "Terms of Service — XITE College SaaS Platform",
  description: "Terms of Service and legal agreement for using XITE.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white">
      <HeaderNavbar />

      <div className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-400 mb-6">
          <Scale className="h-3.5 w-3.5" />
          <span>Legal Terms & Agreements</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-neutral-400 mb-12">
          Effective Date: July 29, 2026 • Governs all user access to XITE website builder platform.
        </p>

        <div className="space-y-10 text-neutral-300 text-sm sm:text-base leading-relaxed border-t border-neutral-800 pt-10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing, registering, or publishing websites using XITE, educational institutions and authorized administrators agree to abide by these Terms of Service and all applicable accreditation and state educational standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              2. Platform Service Guarantee
            </h2>
            <p>
              XITE guarantees 99.9% uptime for published college websites, automatic SSL certificates, fast CDN delivery, and real-time schema validation for NAAC compliance files.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" /> 3. Acceptable Use Policy
            </h2>
            <p>
              Subdomains and custom domains hosted on XITE must strictly contain legitimate educational content, official department communications, authentic faculty listings, and student resources. Spam, malware, or misleading content will result in immediate subdomain suspension.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              4. Intellectual Property & Brand Rights
            </h2>
            <p>
              Institutions maintain full copyright over their logos, trademarks, text, and images. XITE retains rights to its platform software, visual builder components, and template layouts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              5. Legal Inquiries
            </h2>
            <p>
              For legal communications or contract agreements, contact <a href="mailto:legal@xite.co.in" className="text-purple-400 underline">legal@xite.co.in</a>.
            </p>
          </section>
        </div>
      </div>

      <CinematicFooter />
    </main>
  );
}
