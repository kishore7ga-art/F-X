import React from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Mail, MessageSquare, PhoneCall, Sparkles, BookOpen } from "lucide-react";
import { HeaderNavbar } from "@/components/landing/HeaderNavbar";
import { CinematicFooter } from "@/components/ui/motion-footer";

export const metadata = {
  title: "Support & Help Center — XITE College SaaS Platform",
  description: "Get immediate support, FAQs, and help for XITE website builder.",
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white">
      <HeaderNavbar />

      <div className="mx-auto max-w-5xl px-6 pt-32 pb-24">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-6">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>24/7 Dedicated Institutional Support</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
          How can we help your institution?
        </h1>
        <p className="text-base text-neutral-400 mb-12 max-w-2xl">
          Get fast technical assistance, template setup guidance, domain DNS configuration support, or NAAC audit documentation help.
        </p>

        {/* Support Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col justify-between hover:border-neutral-700 transition">
            <div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Email Support</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Send your technical queries to our core engineering team for response within 1 hour.
              </p>
            </div>
            <a href="mailto:support@xite.co.in" className="text-xs font-bold text-blue-400 hover:underline">
              support@xite.co.in →
            </a>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col justify-between hover:border-neutral-700 transition">
            <div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Connect directly with website designers and domain experts inside the XITE Editor.
              </p>
            </div>
            <Link href="/start" className="text-xs font-bold text-purple-400 hover:underline">
              Open Live Editor →
            </Link>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col justify-between hover:border-neutral-700 transition">
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <PhoneCall className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Priority Helpline</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Direct phone support for enterprise college plans and urgent NAAC deadline updates.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400">+91 (800) 456-XITE</span>
          </div>
        </div>

        {/* FAQs */}
        <div className="border-t border-neutral-800 pt-12 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            <BookOpen className="h-6 w-6 text-blue-400" /> Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <details className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-bold text-white text-sm sm:text-base">
                <span>How do I map our custom college domain (e.g. roeverengg.edu.in)?</span>
                <span className="shrink-0 transition group-open:-rotate-180">↓</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                In your domain registrar (GoDaddy, BigRock, NIC), point your CNAME record to `custom.xite.co.in`. Our automated SSL engine will issue an HTTPS certificate within 60 seconds.
              </p>
            </details>

            <details className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-bold text-white text-sm sm:text-base">
                <span>Can multiple department HODs edit their own pages?</span>
                <span className="shrink-0 transition group-open:-rotate-180">↓</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Yes! XITE provides Role-Based Access Control (RBAC). The principal/admin can invite HODs with scoped access to edit only their department sections.
              </p>
            </details>

            <details className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-bold text-white text-sm sm:text-base">
                <span>Is content preserved when changing templates?</span>
                <span className="shrink-0 transition group-open:-rotate-180">↓</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Absolutely. XITE decouples institutional data schemas from theme presentations. You can switch between 10+ college templates anytime without losing a single word.
              </p>
            </details>
          </div>
        </div>
      </div>

      <CinematicFooter />
    </main>
  );
}
