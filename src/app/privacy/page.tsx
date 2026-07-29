import React from "react";
import Link from "next/link";
import { HeaderNavbar } from "@/components/landing/HeaderNavbar";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — XITE College SaaS Platform",
  description: "Official Privacy Policy and Data Protection standards for XITE College Website Builder.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <HeaderNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 pt-36 pb-20 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-6 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>Data Protection & FERPA/GDPR Compliant</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Last Updated: July 2026. XITE is committed to ensuring institutional security, student data protection, and complete privacy transparency.
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl">
            <Lock className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">256-bit Encryption</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              All institutional data, student applications, and admin credentials are encrypted in transit and at rest.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl">
            <Eye className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Zero Tracking Sale</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              We never sell student analytics, faculty records, or institutional logs to third-party ad brokers.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl">
            <FileText className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">NAAC & FERPA Compliant</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Our audit logs and data storage comply with national educational mandates and institutional governance.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-12 text-neutral-300 leading-relaxed bg-neutral-900/40 p-8 md:p-12 rounded-3xl border border-white/10">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-blue-400" /> 1. Information We Collect
            </h2>
            <p className="mb-4">
              When educational institutions, administrators, or faculty use XITE, we process necessary technical and administrative data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-400">
              <li><strong className="text-white">Account Data:</strong> Administrator names, official institutional email addresses, roles, and hashed credentials.</li>
              <li><strong className="text-white">College Website Content:</strong> Departments, course syllabus, notices, events, faculty bios, and NAAC disclosures uploaded to XITE.</li>
              <li><strong className="text-white">Usage Analytics:</strong> Anonymized site visitor metrics, page load speeds, and browser telemetry to optimize hosting performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-purple-400" /> 2. How We Use Information
            </h2>
            <p className="text-neutral-400">
              We strictly utilize collected data to render multi-tenant college subdomains, issue automatic SSL certificates, deliver visual builder changes, and maintain high-speed CDN delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" /> 3. Data Storage & Security
            </h2>
            <p className="text-neutral-400">
              All website assets and databases are hosted on enterprise-grade PostgreSQL and edge CDNs with automatic daily backups, DDoS protection, and strict row-level security isolation per college tenant.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Contact Our Data Protection Officer</h2>
            <p className="text-neutral-400">
              If you have any questions regarding privacy practices or institutional data export requests, please contact our security team at{" "}
              <a href="mailto:privacy@xite.co.in" className="text-blue-400 underline">privacy@xite.co.in</a>.
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
