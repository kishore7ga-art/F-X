"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HeaderNavbar } from "@/components/landing/HeaderNavbar";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { LifeBuoy, Mail, MessageSquare, PhoneCall, CheckCircle2, ChevronDown } from "lucide-react";
import { LitButton } from "@/components/ui/LitButton";

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      q: "How fast can we launch our official college website?",
      a: "Using XITE Visual Builder, you can choose a template, input your institution details, and publish a complete multi-page NAAC-compliant site in less than 30 minutes.",
    },
    {
      q: "Can we connect our custom college domain (e.g., college.ac.in)?",
      a: "Yes! XITE provides one-click CNAME domain binding with automatic SSL certification for custom .ac.in, .edu.in, and .org domains.",
    },
    {
      q: "How do faculty members update notices or exam timetables?",
      a: "Authorized staff can log in to the XITE Admin Editor, click on any section, edit text or upload PDFs directly, and hit 'Publish' for instant updates.",
    },
    {
      q: "Is XITE compliant with NAAC & NIRF requirements?",
      a: "Absolutely. All XITE templates feature pre-built mandatory disclosure pages, IQAC sections, NIRF report tabs, and accessible PDF document hosting.",
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <HeaderNavbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 pt-36 pb-20 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-6 backdrop-blur-md">
            <LifeBuoy className="h-4 w-4 text-emerald-400" />
            <span>24/7 Institutional Technical Support</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            How can we help your institution?
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Our engineering & design team is available round-the-clock to assist with website setup, domain binding, custom templates, and NAAC disclosures.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl text-center">
            <Mail className="h-8 w-8 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">Email Support</h3>
            <p className="text-xs text-neutral-400 mb-4">Direct assistance for web admins</p>
            <a href="mailto:support@xite.co.in" className="text-blue-400 font-semibold text-sm hover:underline">
              support@xite.co.in
            </a>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl text-center">
            <PhoneCall className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">Priority Helpline</h3>
            <p className="text-xs text-neutral-400 mb-4">Immediate phone support for admins</p>
            <span className="text-emerald-400 font-semibold text-sm">
              +91 (044) 4800-XITE
            </span>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl text-center">
            <MessageSquare className="h-8 w-8 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">Live Chat</h3>
            <p className="text-xs text-neutral-400 mb-4">Available inside the XITE Visual Editor</p>
            <span className="text-purple-400 font-semibold text-sm">
              Live inside Dashboard
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Ticket Form */}
          <div className="bg-neutral-900/40 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white mb-2">Submit a Support Ticket</h2>
            <p className="text-sm text-neutral-400 mb-6">Fill in your request and our technical team will respond within 2 hours.</p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center py-10">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Ticket Submitted Successfully!</h3>
                <p className="text-sm text-neutral-300">Ticket ID: #XITE-{Math.floor(100000 + Math.random() * 900000)}. Our support engineer will contact your email shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-xs text-blue-400 hover:underline"
                >
                  Submit another ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madras Engineering College"
                    className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@college.ac.in"
                    className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Issue Category</label>
                  <select className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white focus:border-blue-500 outline-none">
                    <option>Custom Domain Binding</option>
                    <option>Visual Builder Assistance</option>
                    <option>NAAC Disclosure Setup</option>
                    <option>Account & Billing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your request or issue in detail..."
                    className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-blue-500 outline-none"
                  ></textarea>
                </div>
                <LitButton type="submit" className="w-full mt-2">
                  Submit Support Ticket
                </LitButton>
              </form>
            )}
          </div>

          {/* FAQs Accordion */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-neutral-400 mb-6">Quick answers to common institutional setup questions.</p>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-neutral-900/40 border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-white font-semibold text-sm sm:text-base hover:bg-white/5 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-blue-400' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-neutral-300 border-t border-white/5 leading-relaxed bg-black/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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
