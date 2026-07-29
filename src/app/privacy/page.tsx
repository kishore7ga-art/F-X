import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from "lucide-react";
import { HeaderNavbar } from "@/components/landing/HeaderNavbar";
import { CinematicFooter } from "@/components/ui/motion-footer";

export const metadata = {
  title: "Privacy Policy — XITE College SaaS Platform",
  description: "Privacy Policy and data protection guidelines for institutions using XITE.",
};

export default function PrivacyPage() {
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
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-6">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Data Governance & Trust</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-neutral-400 mb-12">
          Last Updated: July 29, 2026 • Applies to all XITE SaaS services, subdomains, and published college websites.
        </p>

        <div className="space-y-10 text-neutral-300 text-sm sm:text-base leading-relaxed border-t border-neutral-800 pt-10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-400" /> 1. Commitment to Institutional Data Privacy
            </h2>
            <p>
              At XITE, we respect the data sovereignty of educational institutions, administrators, faculty, and students. We do not sell, monetize, or harvest institutional content, academic records, or visitor analytics from published college websites.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-400" /> 2. Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-2 text-neutral-400 pl-2">
              <li><strong className="text-white">Account Information:</strong> Administrator name, institutional email address, hashed passwords, and authentication credentials.</li>
              <li><strong className="text-white">Website Content:</strong> Text, images, department structures, faculty directories, NAAC reports, and documents uploaded to the XITE editor.</li>
              <li><strong className="text-white">Usage & Telemetry:</strong> Anonymized performance logs, editor action metrics, and server health diagnostics.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" /> 3. How We Use Information
            </h2>
            <p>
              Collected information is exclusively utilized to render published subdomains, serve custom college domains, manage role-based access control, enforce security rules, and generate real-time analytics for institution administrators.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              4. Data Retention & Deletion
            </h2>
            <p>
              Institutions retain 100% ownership of their website data. Administrators may export their complete website state or request permanent server purge at any time via the XITE Dashboard.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              5. Contact Our Data Security Office
            </h2>
            <p>
              If you have questions about privacy compliance, NAAC audit data handling, or security protocols, please reach out to <a href="mailto:privacy@xite.co.in" className="text-blue-400 underline">privacy@xite.co.in</a>.
            </p>
          </section>
        </div>
      </div>

      <CinematicFooter />
    </main>
  );
}
