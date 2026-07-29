import React from "react";
import Link from "next/link";
import { HeaderNavbar } from "@/components/landing/HeaderNavbar";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { Scale, FileCheck, Server, HelpCircle, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms of Service — XITE College SaaS Platform",
  description: "Terms of Service and Agreement for institutions using XITE Website Builder.",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <HeaderNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 pt-36 pb-20 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-400 mb-6 backdrop-blur-md">
            <Scale className="h-4 w-4 text-purple-400" />
            <span>Institutional Agreement & SLA</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Terms of Service
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Effective Date: July 2026. By accessing or publishing websites via XITE, educational institutions agree to these governance terms.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl">
            <FileCheck className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Full Content Ownership</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Institutions retain 100% intellectual property rights over all uploaded text, images, and documents.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl">
            <Server className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">99.9% Uptime Guarantee</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Guaranteed institutional server availability with automated multi-region edge deployment.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl">
            <HelpCircle className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Instant Custom Domains</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Support for custom .edu, .ac.in, and institutional subdomains with free SSL renewal.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-12 text-neutral-300 leading-relaxed bg-neutral-900/40 p-8 md:p-12 rounded-3xl border border-white/10">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-blue-400" /> 1. Acceptable Use Policy
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              XITE accounts must be used exclusively for educational, academic, administrative, and institutional communication. Accounts broadcasting malicious software, unlawful content, or unauthorized impersonation will be suspended immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-purple-400" /> 2. Publishing & Custom Domains
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              When publishing pages to your custom domain or subdomains, XITE automatically builds static CDN routes. You are responsible for ensuring all published announcements and college notices comply with local accreditation requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" /> 3. Service Level Agreement (SLA)
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              We provide 24/7 monitoring and technical response for all institutional sites. Scheduled maintenance windows are announced at least 48 hours in advance during low-traffic weekend hours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Terms Modifications & Legal Contact</h2>
            <p className="text-neutral-400">
              For questions regarding custom enterprise SLAs, legal agreements, or billing queries, contact our team at{" "}
              <a href="mailto:legal@xite.co.in" className="text-purple-400 underline">legal@xite.co.in</a>.
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition">
            ← Back to Home
          </Link>
        </div>
      </main>

      <CinematicFooter />
    </div>
  );
}
