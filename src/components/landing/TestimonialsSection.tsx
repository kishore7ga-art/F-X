"use client";

import React from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const testimonials = [
  {
    quote:
      "Before XITE, updating our college website required technical support every time. Now our team edits pages, posts notices, and updates admissions in minutes without writing a single line of code.",
    name: "Dr. Arjun Raman",
    title: "Principal, Crescent Institute of Technology",
  },
  {
    quote:
      "Launching our new admission portal with XITE was effortless. The AI generated our website structure instantly, and we customized everything through the visual builder. What used to take weeks now takes hours.",
    name: "Priya Nair",
    title: "Admission Director, Horizon Engineering College",
  },
  {
    quote:
      "The built-in Academic CMS has transformed how we manage departments, faculty profiles, events, and student announcements. Everything is organized in one place and always up to date.",
    name: "Prof. Karthik Menon",
    title: "Dean of Academics, Future Tech University",
  },
  {
    quote:
      "Our website now reflects the quality of our institution. From responsive design to SEO optimization, XITE helped us attract more admission inquiries than ever before.",
    name: "Sneha Krishnan",
    title: "Marketing Head, Royal College of Engineering",
  },
  {
    quote:
      "The ready-made templates gave us a professional website on day one, while the drag-and-drop builder let us personalize every section. It feels like having a full web development team.",
    name: "Rahul Sharma",
    title: "IT Administrator, National Institute of Science",
  },
  {
    quote:
      "The Live Preview feature eliminated guesswork. We could instantly see every change before publishing, making collaboration between our management and design team incredibly smooth.",
    name: "Ananya Iyer",
    title: "Digital Communications Manager, Excel Group of Colleges",
  },
  {
    quote:
      "XITE's AI Website Builder understood our institution's requirements and generated a complete college website within minutes. It saved us months of planning and development.",
    name: "Dr. Vivek Patel",
    title: "Chairman, Aspire Educational Trust",
  },
  {
    quote:
      "Managing admissions, departments, faculty information, placements, and campus news from one dashboard has made our workflow significantly faster. XITE is now an essential part of our digital operations.",
    name: "Meera Joshi",
    title: "Registrar, Global Institute of Technology",
  },
  {
    quote:
      "Our previous website looked outdated and was difficult to maintain. After moving to XITE, we gained a modern design, better performance, and an editing experience that anyone on our team can use.",
    name: "Suresh Kumar",
    title: "Head of IT, Zenith College",
  },
  {
    quote:
      "XITE helped us build a premium college website without hiring an agency. The speed, AI automation, and visual builder exceeded our expectations.",
    name: "Dr. Lakshmi Narayanan",
    title: "Director, Excellence Engineering College",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full bg-black py-24 relative overflow-hidden">


      {/* Section heading */}
      <div className="text-center mb-16 px-6">
        <p className="text-blue-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">
          BUILT FOR COLLEGES
        </p>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
          Trusted by educators
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            across the country
          </span>
        </h2>
      </div>

      {/* Scrolling cards — two rows, opposite directions */}
      <div className="flex flex-col gap-6">
        <InfiniteMovingCards
          items={testimonials.slice(0, 5)}
          direction="right"
          speed="slow"
        />
        <InfiniteMovingCards
          items={testimonials.slice(5)}
          direction="left"
          speed="slow"
        />
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
