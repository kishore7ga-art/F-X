"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AddSectionButton } from "@/components/ui/AddSectionButton";
import {
  Plus,
  Eye,
  Layout,
  RefreshCw,
  X,
  Info,
  GraduationCap,
  Users,
  Calendar,
  Mail,
  Briefcase,
  Award,
  AlertCircle,
  Compass,
  Target,
  Building2,
  Building,
  FileCheck,
  FlaskConical,
  Newspaper,
  Image,
  Quote,
  Trophy,
  MapPin,
  Footprints,
} from "lucide-react";
import { EditorToolbar } from "./EditorToolbar";
import { DrawerPanel } from "./DrawerPanel";
import { DomainSettingsModal } from "./DomainSettingsModal";
import { UserProfileMenu } from "./UserProfileMenu";

interface SectionItem {
  id: string;
  title: string;
  code: string;
  variantIndex: number;
  category?: string;
}

const SECTION_CATEGORIES = [
  { id: "navbar", name: "Navbar / Header", description: "Top navigation bar with logo, menu links & action buttons", icon: Compass },
  { id: "hero", name: "Hero Banner", description: "Lead banner, masthead & title headline", icon: Layout },
  { id: "highlights", name: "College Highlights", description: "Key stats, NIRF rankings & accreditation badges", icon: Award },
  { id: "about", name: "About College", description: "College history, overview & leadership message", icon: Info },
  { id: "vision", name: "Vision & Mission", description: "Institutional core values, vision & long-term goals", icon: Target },
  { id: "courses", name: "Courses / Programs Offered", description: "UG, PG & Ph.D degree programs grid", icon: GraduationCap },
  { id: "departments", name: "Departments", description: "Engineering, Science, Arts & Business faculties", icon: Building2 },
  { id: "admissions", name: "Admission Section", description: "Eligibility, fee structure & apply online form", icon: FileCheck },
  { id: "placements", name: "Placement & Recruiters", description: "Highest package stats & top hiring companies", icon: Briefcase },
  { id: "facilities", name: "Campus Facilities", description: "Library, hostels, sports complex & labs", icon: Building },
  { id: "research", name: "Research & Innovation", description: "Patents, R&D labs & published research papers", icon: FlaskConical },
  { id: "news", name: "News & Announcements", description: "Official circulars, notices & campus news", icon: Newspaper },
  { id: "events", name: "Upcoming Events", description: "Cultural fests, symposiums & workshops calendar", icon: Calendar },
  { id: "gallery", name: "Gallery / Campus Life", description: "Photo gallery, campus infrastructure & student life", icon: Image },
  { id: "testimonials", name: "Student Testimonials", description: "Alumni reviews, student experiences & stories", icon: Quote },
  { id: "achievements", name: "Achievements & Awards", description: "National awards, sports trophies & rankings", icon: Trophy },
  { id: "contact", name: "Contact / Enquiry Form", description: "Admissions helpdesk, address & contact form", icon: Mail },
  { id: "map", name: "Map & Location", description: "Interactive campus map, directions & transportation", icon: MapPin },
  { id: "footer", name: "Footer", description: "Bottom copyright, quick links & social icons", icon: Footprints },
];

const ALL_19_SECTION_TEMPLATES: Record<string, string> = {
  navbar: `<header style="background: rgba(9, 14, 26, 0.95); backdrop-filter: blur(12px); color: #ffffff; padding: 14px 40px; font-family: system-ui, -apple-system, sans-serif; width: 100%; box-sizing: border-box; border-bottom: 1px solid rgba(255,255,255,0.12); position: sticky; top: 0; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
    <div style="max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 14px; flex-shrink: 0;">
        <img src="https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80" alt="University Logo" data-logo="true" style="width: 44px; height: 44px; object-fit: cover; border-radius: 50%; background: #ffffff; padding: 2px; border: 2px solid rgba(255,255,255,0.3); cursor: pointer;" title="Right-click to edit university logo!" />
        <div>
          <span style="font-size: 18px; font-weight: 900; color: #ffffff; letter-spacing: 0.03em; display: block; line-height: 1.1;">VELLORE INSTITUTE OF TECHNOLOGY</span>
          <span style="font-size: 10px; color: #38bdf8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em;">DEEMED TO BE UNIVERSITY</span>
        </div>
      </div>

      <nav class="desktop-nav-links" style="display: flex; align-items: center; gap: clamp(10px, 1.6vw, 24px); font-size: 13px; font-weight: 800; flex-wrap: nowrap;">
        <a href="#home" style="color: #ffffff; text-decoration: none; padding: 6px 0; white-space: nowrap;">Home</a>
        <a href="#about" style="color: #e2e8f0; text-decoration: none; padding: 6px 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 3px;">About <span style="font-size: 9px; opacity: 0.7;">▾</span></a>
        <a href="#courses" style="color: #e2e8f0; text-decoration: none; padding: 6px 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 3px;">Academics <span style="font-size: 9px; opacity: 0.7;">▾</span></a>
        <a href="#admissions" style="color: #e2e8f0; text-decoration: none; padding: 6px 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 3px;">Admissions <span style="font-size: 9px; opacity: 0.7;">▾</span></a>
        <a href="#placements" style="color: #e2e8f0; text-decoration: none; padding: 6px 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 3px;">Career Development <span style="font-size: 9px; opacity: 0.7;">▾</span></a>
        <a href="#research" style="color: #e2e8f0; text-decoration: none; padding: 6px 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 3px;">Research <span style="font-size: 9px; opacity: 0.7;">▾</span></a>
        <a href="#gallery" style="color: #e2e8f0; text-decoration: none; padding: 6px 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 3px;">Campus Life <span style="font-size: 9px; opacity: 0.7;">▾</span></a>
      </nav>

      <a href="#contact" class="desktop-apply-btn" style="background: #2563eb; color: #ffffff; padding: 9px 22px; border-radius: 8px; font-size: 13px; font-weight: 800; text-decoration: none; white-space: nowrap; flex-shrink: 0; box-shadow: 0 4px 14px rgba(37,99,235,0.4);">Apply 2026</a>

      <button class="hamburger-toggle-btn" style="display: none; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #ffffff; padding: 8px 14px; border-radius: 8px; font-size: 20px; cursor: pointer; align-items: center; justify-content: center;" aria-label="Toggle Navigation Menu">
        ☰
      </button>
    </div>

    <div class="mobile-drawer-menu" style="display: none; width: 100%; background: #090e1a; border-top: 1px solid rgba(255,255,255,0.1); padding: 16px 20px; margin-top: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <nav style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 800;">
        <a href="#home" style="color: #ffffff; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Home</a>
        <a href="#about" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">About Institution</a>
        <a href="#courses" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Academics & Specializations</a>
        <a href="#admissions" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Admissions 2026</a>
        <a href="#placements" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Career Development & Placements</a>
        <a href="#research" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Research & Innovation</a>
        <a href="#gallery" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Campus Life & Facilities</a>
        <a href="#contact" style="color: #38bdf8; text-decoration: none; padding: 10px 0;">Contact Helpdesk</a>
      </nav>
    </div>

    <script>
      document.querySelector('.hamburger-toggle-btn').onclick = function() {
        document.querySelector('.mobile-drawer-menu').classList.toggle('active');
      };
    </script>

    <style>
      @media (max-width: 900px) {
        .desktop-nav-links { display: none !important; }
        .desktop-apply-btn { display: inline-flex !important; font-size: 12px !important; padding: 6px 12px !important; margin-left: auto !important; }
        .hamburger-toggle-btn { display: inline-flex !important; font-size: 18px !important; padding: 6px 10px !important; margin-left: 4px !important; }
        .mobile-drawer-menu.active { display: block !important; width: 100% !important; }
      }
      @media (min-width: 901px) {
        .hamburger-toggle-btn, .mobile-drawer-menu { display: none !important; }
        .desktop-nav-links { display: flex !important; }
        .desktop-apply-btn { display: inline-block !important; }
      }
    </style>
  </header>`,

  hero: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px 60px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-bottom: 1px solid #e2e8f0;">
    <div style="max-width: 960px; margin: 0 auto;">
      <span style="background: #ffe4e6; border: 1px solid #f43f5e; color: #e11d48; padding: 6px 20px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">ADMISSIONS OPEN 2026–2027</span>
      <h1 style="font-size: 56px; font-weight: 900; margin-top: 24px; line-height: 1.15; color: #0f172a; letter-spacing: -0.02em;">Empowering Minds, Shaping Tomorrow's Leaders</h1>
      <p style="font-size: 18px; color: #64748b; margin-top: 20px; line-height: 1.6; max-width: 840px; margin-left: auto; margin-right: auto; font-weight: 500;">Join a world-class academic community dedicated to innovation, groundbreaking research, and personal growth. Discover over 120 undergraduate and graduate programs tailored for your future.</p>
      <div style="margin-top: 36px; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
        <a href="#admissions" style="background: #ef4444; color: #ffffff; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4); display: inline-block;">Apply Now</a>
        <a href="#courses" style="background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; display: inline-block;">Explore Programs</a>
      </div>
      <div style="margin-top: 60px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; border-top: 1px solid #e2e8f0; padding-top: 32px;">
        <div>
          <div style="font-size: 28px; font-weight: 900; color: #0f172a;">#12</div>
          <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">NATIONAL RANK</div>
        </div>
        <div>
          <div style="font-size: 28px; font-weight: 900; color: #0f172a;">120+</div>
          <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">ACADEMIC MAJORS</div>
        </div>
        <div>
          <div style="font-size: 28px; font-weight: 900; color: #0f172a;">96%</div>
          <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">GRADUATE PLACEMENT</div>
        </div>
        <div>
          <div style="font-size: 28px; font-weight: 900; color: #0f172a;">10:1</div>
          <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">STUDENT-FACULTY RATIO</div>
        </div>
      </div>
    </div>
  </section>`,

  highlights: `<section style="background: #0f172a; color: #ffffff; padding: 60px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center;">
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">#15</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">NIRF National Rank</p></div>
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">98.4%</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Placement Record</p></div>
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">500+</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Top Recruiters</p></div>
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">15,000+</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Active Students</p></div>
    </div>
  </section>`,

  about: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;">
      <div>
        <span style="color: #2563eb; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">OUR HERITAGE</span>
        <h2 style="font-size: 36px; font-weight: 900; margin-top: 12px; color: #0f172a;">Building Tomorrow's Global Tech Leaders</h2>
        <p style="font-size: 15px; color: #475569; margin-top: 16px; line-height: 1.7;">Established in 1985, Greenfield University has been at the forefront of academic excellence, technological innovation, and societal advancement for over four decades.</p>
      </div>
      <div style="background: #f1f5f9; padding: 32px; border-radius: 24px; border: 1px solid #e2e8f0;">
        <h4 style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 0;">Key Accreditations</h4>
        <ul style="margin-top: 16px; padding-left: 20px; color: #334155; font-size: 14px; font-weight: 600; line-height: 1.8;">
          <li>NAAC A++ Grade Accreditation</li>
          <li>AICTE & UGC Approved University</li>
          <li>NIRF Top 20 Engineering Institutions</li>
        </ul>
      </div>
    </div>
  </section>`,

  vision: `<section style="background: #f8fafc; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 36px; font-weight: 900; color: #0f172a;">Vision & Mission Statement</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px;">
        <div style="background: #ffffff; padding: 36px; border-radius: 20px; border: 1px solid #e2e8f0; text-align: left; box-shadow: 0 4px 6px rgba(0,0,0,0.03);">
          <div style="font-size: 28px; margin-bottom: 12px;">🎯</div>
          <h3 style="font-size: 20px; font-weight: 900; color: #0f172a;">Institutional Vision</h3>
          <p style="font-size: 14px; color: #475569; margin-top: 10px; line-height: 1.7;">To be a globally recognized center of academic excellence and research that produces visionary leaders and ethical global citizens.</p>
        </div>
        <div style="background: #ffffff; padding: 36px; border-radius: 20px; border: 1px solid #e2e8f0; text-align: left; box-shadow: 0 4px 6px rgba(0,0,0,0.03);">
          <div style="font-size: 28px; margin-bottom: 12px;">🚀</div>
          <h3 style="font-size: 20px; font-weight: 900; color: #0f172a;">Core Mission</h3>
          <p style="font-size: 14px; color: #475569; margin-top: 10px; line-height: 1.7;">To impart high-quality education, foster innovative research, and nurture industry-ready talent through holistic experiential learning.</p>
        </div>
      </div>
    </div>
  </section>`,

  courses: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto;">
      <div style="text-align: center; max-width: 700px; margin: 0 auto;">
        <span style="color: #2563eb; font-size: 12px; font-weight: 900; text-transform: uppercase;">ACADEMIC DEGREES</span>
        <h2 style="font-size: 36px; font-weight: 900; margin-top: 8px;">Explore Our Degree Programs</h2>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 28px; border-radius: 20px;"><h3 style="font-size: 18px; font-weight: 900; color: #0f172a;">B.Tech Computer Science</h3><p style="font-size: 13px; color: #64748b; margin-top: 8px;">4 Years Undergraduate Degree in AI, ML & Software Systems.</p><a href="#apply" style="color: #2563eb; font-size: 13px; font-weight: 800; text-decoration: none; display: inline-block; margin-top: 16px;">View Curriculum →</a></div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 28px; border-radius: 20px;"><h3 style="font-size: 18px; font-weight: 900; color: #0f172a;">M.Tech Data Science</h3><p style="font-size: 13px; color: #64748b; margin-top: 8px;">2 Years Postgraduate Specialization in Big Data Analytics.</p><a href="#apply" style="color: #2563eb; font-size: 13px; font-weight: 800; text-decoration: none; display: inline-block; margin-top: 16px;">View Curriculum →</a></div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 28px; border-radius: 20px;"><h3 style="font-size: 18px; font-weight: 900; color: #0f172a;">MBA Business Analytics</h3><p style="font-size: 13px; color: #64748b; margin-top: 8px;">2 Years Management Program in Finance, Marketing & Operations.</p><a href="#apply" style="color: #2563eb; font-size: 13px; font-weight: 800; text-decoration: none; display: inline-block; margin-top: 16px;">View Curriculum →</a></div>
      </div>
    </div>
  </section>`,

  departments: `<section style="background: #f1f5f9; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto;">
      <h2 style="font-size: 32px; font-weight: 900; text-align: center;">Academic Departments</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h4 style="font-size: 16px; font-weight: 900;">School of Engineering</h4><p style="font-size: 13px; color: #64748b; margin-top: 6px;">CSE, ECE, Mechanical, Civil & AI Labs</p></div>
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h4 style="font-size: 16px; font-weight: 900;">School of Management</h4><p style="font-size: 13px; color: #64748b; margin-top: 6px;">MBA, BBA, Finance & HR Specializations</p></div>
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h4 style="font-size: 16px; font-weight: 900;">School of Basic Sciences</h4><p style="font-size: 13px; color: #64748b; margin-top: 6px;">Physics, Chemistry & Applied Mathematics</p></div>
      </div>
    </div>
  </section>`,

  admissions: `<section style="background: #0f172a; color: #ffffff; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 900px; margin: 0 auto; text-align: center;">
      <span style="background: #2563eb; color: #ffffff; padding: 4px 16px; border-radius: 9999px; font-size: 11px; font-weight: 900;">ADMISSIONS 2026-27 OPEN</span>
      <h2 style="font-size: 38px; font-weight: 900; margin-top: 16px;">Begin Your Journey With Us</h2>
      <p style="font-size: 15px; color: #94a3b8; margin-top: 12px;">Applications are open for UG & PG academic sessions. Merit scholarship applications closing soon.</p>
      <div style="margin-top: 32px; display: flex; justify-content: center; gap: 16px;">
        <a href="#apply" style="background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none;">Apply Online Now</a>
        <a href="#prospectus" style="background: #1e293b; color: #ffffff; border: 1px solid #334155; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none;">Download Prospectus PDF</a>
      </div>
    </div>
  </section>`,

  placements: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 36px; font-weight: 900;">Placement & Top Recruiters</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 36px;">
        <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h3 style="font-size: 32px; font-weight: 900; color: #2563eb; margin: 0;">₹52 LPA</h3><p style="font-size: 13px; color: #64748b; font-weight: 700;">Highest National Package</p></div>
        <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h3 style="font-size: 32px; font-weight: 900; color: #2563eb; margin: 0;">₹12.4 LPA</h3><p style="font-size: 13px; color: #64748b; font-weight: 700;">Average Campus Salary</p></div>
        <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h3 style="font-size: 32px; font-weight: 900; color: #2563eb; margin: 0;">450+</h3><p style="font-size: 13px; color: #64748b; font-weight: 700;">Recruiting Partners</p></div>
      </div>
    </div>
  </section>`,

  facilities: `<section style="background: #f8fafc; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 32px; font-weight: 900;">World-Class Campus Infrastructure</h2>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 36px;">
        <div style="background: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="font-size: 24px;">📚</div><h4 style="font-size: 15px; font-weight: 900; margin-top: 8px;">Digital Library</h4></div>
        <div style="background: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="font-size: 24px;">🏢</div><h4 style="font-size: 15px; font-weight: 900; margin-top: 8px;">Modern Hostels</h4></div>
        <div style="background: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="font-size: 24px;">⚽</div><h4 style="font-size: 15px; font-weight: 900; margin-top: 8px;">Sports Complex</h4></div>
        <div style="background: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0;"><div style="font-size: 24px;">🔬</div><h4 style="font-size: 15px; font-weight: 900; margin-top: 8px;">Advanced Research Labs</h4></div>
      </div>
    </div>
  </section>`,

  research: `<section style="background: #0d1527; color: #ffffff; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
      <span style="color: #38bdf8; font-size: 12px; font-weight: 900; text-transform: uppercase;">PATENTS & R&D</span>
      <h2 style="font-size: 36px; font-weight: 900; margin-top: 10px;">Pioneering Research & Innovation Labs</h2>
      <p style="font-size: 15px; color: #94a3b8; margin-top: 14px; max-width: 700px; margin-left: auto; margin-right: auto;">Over 120+ published research papers and 35 national patents filed in AI, Robotics, Renewable Energy & Semiconductor Design.</p>
    </div>
  </section>`,

  news: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto;">
      <h2 style="font-size: 32px; font-weight: 900; text-align: center;">News & Official Circulars</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 36px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px;"><span style="font-size: 11px; font-weight: 800; color: #2563eb;">AUG 10, 2026</span><h4 style="font-size: 15px; font-weight: 900; margin-top: 6px;">End-Semester Examination Schedule Released</h4></div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px;"><span style="font-size: 11px; font-weight: 800; color: #2563eb;">AUG 15, 2026</span><h4 style="font-size: 15px; font-weight: 900; margin-top: 6px;">79th Independence Day Celebration Convocation</h4></div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px;"><span style="font-size: 11px; font-weight: 800; color: #2563eb;">SEP 01, 2026</span><h4 style="font-size: 15px; font-weight: 900; margin-top: 6px;">International Student Exchange Orientation</h4></div>
      </div>
    </div>
  </section>`,

  events: `<section style="background: #f1f5f9; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto;">
      <h2 style="font-size: 32px; font-weight: 900; text-align: center;">Upcoming Campus Events</h2>
      <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 36px;">
        <div style="background: #ffffff; padding: 20px 28px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;"><div style="display: flex; align-items: center; gap: 20px;"><div style="background: #0f172a; color: #ffffff; padding: 10px 16px; border-radius: 12px; font-weight: 900; text-align: center;"><span style="font-size: 18px; display: block;">24</span><span style="font-size: 11px;">AUG</span></div><div><h4 style="font-size: 16px; font-weight: 900; margin: 0;">Global Tech Hackathon 2026</h4><p style="font-size: 13px; color: #64748b; margin-top: 4px;">48-Hour Inter-College Coding Competition</p></div></div><a href="#register" style="background: #2563eb; color: #ffffff; padding: 8px 20px; border-radius: 10px; font-size: 12px; font-weight: 800; text-decoration: none;">Register Now</a></div>
      </div>
    </div>
  </section>`,

  gallery: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 32px; font-weight: 900;">Vibrant Campus Life & Infrastructure</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 36px;">
        <div style="height: 200px; background: #e2e8f0; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #64748b;">Central Auditorium</div>
        <div style="height: 200px; background: #cbd5e1; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #334155;">Sports Arena</div>
        <div style="height: 200px; background: #94a3b8; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #ffffff;">Robotics Research Lab</div>
      </div>
    </div>
  </section>`,

  testimonials: `<section style="background: #0f172a; color: #ffffff; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 32px; font-weight: 900;">What Our Students & Alumni Say</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 36px; text-align: left;">
        <div style="background: #1e293b; padding: 28px; border-radius: 20px; border: 1px solid #334155;"><p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">"The hands-on coding labs and mentor support at Greenfield helped me secure a Software Engineer role at Google."</p><span style="font-size: 13px; font-weight: 900; color: #38bdf8; display: block; margin-top: 16px;">— Rahul Sharma (B.Tech CSE '25)</span></div>
        <div style="background: #1e293b; padding: 28px; border-radius: 20px; border: 1px solid #334155;"><p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">"World-class faculty, vibrant campus events, and incredible placement opportunities made my university years unforgettable."</p><span style="font-size: 13px; font-weight: 900; color: #38bdf8; display: block; margin-top: 16px;">— Priya Sundaram (MBA '24)</span></div>
      </div>
    </div>
  </section>`,

  achievements: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 32px; font-weight: 900;">Awards & Recognitions</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 36px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px;"><div style="font-size: 28px;">🏆</div><h4 style="font-size: 16px; font-weight: 900; margin-top: 8px;">Best Green Campus Award 2025</h4></div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px;"><div style="font-size: 28px;">🎖️</div><h4 style="font-size: 16px; font-weight: 900; margin-top: 8px;">Top 10 Private Engineering University</h4></div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px;"><div style="font-size: 28px;">🌟</div><h4 style="font-size: 16px; font-weight: 900; margin-top: 8px;">National Patent Excellence Citation</h4></div>
      </div>
    </div>
  </section>`,

  contact: `<section style="background: #f8fafc; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
      <h2 style="font-size: 28px; font-weight: 900; text-align: center;">Admissions & Enquiry Form</h2>
      <form style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 28px;">
        <input type="text" placeholder="Full Name *" style="height: 44px; padding: 0 16px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 13px;" />
        <input type="email" placeholder="Email Address *" style="height: 44px; padding: 0 16px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 13px;" />
        <input type="tel" placeholder="Mobile Number *" style="height: 44px; padding: 0 16px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 13px;" />
        <select style="height: 44px; padding: 0 16px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 13px; color: #475569;"><option>Select Preferred Course</option><option>B.Tech CSE</option><option>M.Tech AI</option><option>MBA</option></select>
        <button type="submit" style="grid-column: span 2; height: 48px; background: #2563eb; color: #ffffff; border-radius: 12px; border: none; font-size: 14px; font-weight: 900; cursor: pointer; margin-top: 8px;">Submit Enquiry</button>
      </form>
    </div>
  </section>`,

  map: `<section style="background: #090e1a; color: #ffffff; padding: 70px 24px; font-family: system-ui, -apple-system, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1140px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center;">
      <div style="background: #0f172a; border: 1px solid #1e293b; padding: 32px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
        <span style="color: #38bdf8; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; display: block;">MAIN CAMPUS LOCATION</span>
        <h3 style="font-size: 24px; font-weight: 900; color: #ffffff; margin-top: 8px;">VELLORE INSTITUTE OF TECHNOLOGY</h3>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 8px; line-height: 1.6;">Katpadi - Thiruvalam Rd, Vellore, Tamil Nadu 632014</p>
        <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
          <div style="background: #1e293b; padding: 12px 16px; border-radius: 12px; border: 1px solid #334155; font-size: 12px; color: #e2e8f0; font-weight: 700;">✈️ Airport: Chennai International Airport (approx 2.5 hrs)</div>
          <div style="background: #1e293b; padding: 12px 16px; border-radius: 12px; border: 1px solid #334155; font-size: 12px; color: #e2e8f0; font-weight: 700;">🚆 Railway Station: Katpadi Junction (3 km away)</div>
        </div>
        <a href="https://maps.google.com/?q=Vellore+Institute+of+Technology" target="_blank" class="desktop-apply-btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; width: 100%; background: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 14px rgba(37,99,235,0.4);">GET DIRECTIONS ON GOOGLE MAPS →</a>
      </div>
      <div style="width: 100%; height: 380px; border-radius: 24px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <iframe src="https://maps.google.com/maps?q=Vellore%20Institute%20of%20Technology&t=&z=14&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
  </section>`,

  footer: `<footer style="background: #090d16; color: #94a3b8; padding: 40px 40px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-top: 1px solid #1e293b; text-align: center;">
    <p style="font-size: 13px; font-weight: 700; color: #cbd5e1; margin: 0;">© 2026 Greenfield University. All Rights Reserved.</p>
    <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Approved by AICTE, UGC & Accredited by NAAC A++ Grade.</p>
  </footer>`,
};

const DEFAULT_STARTER_CODE = `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px 60px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-bottom: 1px solid #e2e8f0;">
  <div style="max-width: 960px; margin: 0 auto;">
    <span style="background: #ffe4e6; border: 1px solid #f43f5e; color: #e11d48; padding: 6px 20px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">ADMISSIONS OPEN 2026–2027</span>
    <h1 style="font-size: 56px; font-weight: 900; margin-top: 24px; line-height: 1.15; color: #0f172a; letter-spacing: -0.02em;">Empowering Minds, Shaping Tomorrow's Leaders</h1>
    <p style="font-size: 18px; color: #64748b; margin-top: 20px; line-height: 1.6; max-width: 840px; margin-left: auto; margin-right: auto; font-weight: 500;">Join a world-class academic community dedicated to innovation, groundbreaking research, and personal growth. Discover over 120 undergraduate and graduate programs tailored for your future.</p>
    <div style="margin-top: 36px; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
      <a href="#admissions" style="background: #ef4444; color: #ffffff; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4); display: inline-block;">Apply Now</a>
      <a href="#courses" style="background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; display: inline-block;">Explore Programs</a>
    </div>
    <div style="margin-top: 60px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; border-top: 1px solid #e2e8f0; padding-top: 32px;">
      <div>
        <div style="font-size: 28px; font-weight: 900; color: #0f172a;">#12</div>
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">NATIONAL RANK</div>
      </div>
      <div>
        <div style="font-size: 28px; font-weight: 900; color: #0f172a;">120+</div>
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">ACADEMIC MAJORS</div>
      </div>
      <div>
        <div style="font-size: 28px; font-weight: 900; color: #0f172a;">96%</div>
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">GRADUATE PLACEMENT</div>
      </div>
      <div>
        <div style="font-size: 28px; font-weight: 900; color: #0f172a;">10:1</div>
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">STUDENT-FACULTY RATIO</div>
      </div>
    </div>
  </div>
</section>`;

const PAGE_SECTION_TEMPLATES: Record<string, string> = {
  "/home": `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px 60px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-bottom: 1px solid #e2e8f0;">
  <div style="max-width: 960px; margin: 0 auto;">
    <span style="background: #ffe4e6; border: 1px solid #f43f5e; color: #e11d48; padding: 6px 20px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">ADMISSIONS OPEN 2026–2027</span>
    <h1 style="font-size: 56px; font-weight: 900; margin-top: 24px; line-height: 1.15; color: #0f172a; letter-spacing: -0.02em;">Empowering Minds, Shaping Tomorrow's Leaders</h1>
    <p style="font-size: 18px; color: #64748b; margin-top: 20px; line-height: 1.6; max-width: 840px; margin-left: auto; margin-right: auto; font-weight: 500;">Join a world-class academic community dedicated to innovation, groundbreaking research, and personal growth. Discover over 120 undergraduate and graduate programs tailored for your future.</p>
    <div style="margin-top: 36px; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
      <a href="#admissions" style="background: #ef4444; color: #ffffff; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4); display: inline-block;">Apply Now</a>
      <a href="#courses" style="background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; display: inline-block;">Explore Programs</a>
    </div>
    <div style="margin-top: 60px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; border-top: 1px solid #e2e8f0; padding-top: 32px;">
      <div>
        <div style="font-size: 28px; font-weight: 900; color: #0f172a;">#12</div>
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">NATIONAL RANK</div>
      </div>
      <div>
        <div style="font-size: 28px; font-weight: 900; color: #0f172a;">120+</div>
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">ACADEMIC MAJORS</div>
      </div>
      <div>
        <div style="font-size: 28px; font-weight: 900; color: #0f172a;">96%</div>
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">GRADUATE PLACEMENT</div>
      </div>
      <div>
        <div style="font-size: 28px; font-weight: 900; color: #0f172a;">10:1</div>
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">STUDENT-FACULTY RATIO</div>
      </div>
    </div>
  </div>
</section>`,

  "/about": `<!-- About Us Page Section -->
<section style="background: #0f172a; color: #ffffff; padding: 80px 24px; font-family: system-ui, -apple-system, sans-serif; width: 100%; box-sizing: border-box;">
  <div style="max-width: 900px; margin: 0 auto; text-align: center;">
    <span style="color: #38bdf8; font-size: 12px; font-weight: 800; uppercase; tracking: 0.1em;">OUR HERITAGE & VISION</span>
    <h2 style="font-size: 40px; font-weight: 900; margin-top: 16px; color: #ffffff;">About Our Institution</h2>
    <p style="font-size: 16px; color: #94a3b8; margin-top: 16px; line-height: 1.7;">
      Founded with a commitment to academic rigor and societal advancement, our university nurtures critical thinkers, groundbreaking researchers, and compassionate leaders.
    </p>
  </div>
</section>`,
};

const DEFAULT_FULL_HOME_SECTIONS: SectionItem[] = [
  {
    id: "home-hero",
    title: "Home Banner",
    code: PAGE_SECTION_TEMPLATES["/home"],
    variantIndex: 0,
  },
  {
    id: "home-features",
    title: "Key Features & Academic Highlights",
    code: `<section style="background: #0d1117; color: #ffffff; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-top: 1px solid rgba(255,255,255,0.08);">
  <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
    <span style="background: rgba(37,99,235,0.15); color: #60a5fa; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 800; border: 1px solid rgba(59,130,246,0.3); text-transform: uppercase;">
      WHY CHOOSE OUR INSTITUTION
    </span>
    <h2 style="font-size: 38px; font-weight: 900; margin-top: 18px; color: #ffffff;">World-Class Education & Excellence</h2>
    <p style="font-size: 15px; color: #94a3b8; max-width: 650px; margin: 12px auto 0 auto; line-height: 1.6;">
      Providing global opportunities, cutting-edge research laboratories, and industry-aligned curricula for tomorrow's leaders.
    </p>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 48px; text-align: left;">
      <div style="background: #161b22; padding: 32px; border-radius: 20px; border: 1px solid #30363d;">
        <div style="width: 48px; height: 48px; background: #1f6feb; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px;">🎓</div>
        <h3 style="font-size: 20px; font-weight: 800; margin-top: 18px; color: #ffffff;">Global Accreditation</h3>
        <p style="font-size: 14px; color: #8b949e; margin-top: 8px; line-height: 1.6;">NAAC A++ Grade, NIRF Top Ranked Institution with worldwide degree recognition.</p>
      </div>

      <div style="background: #161b22; padding: 32px; border-radius: 20px; border: 1px solid #30363d;">
        <div style="width: 48px; height: 48px; background: #238636; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px;">🔬</div>
        <h3 style="font-size: 20px; font-weight: 800; margin-top: 18px; color: #ffffff;">Advanced R&D Labs</h3>
        <p style="font-size: 14px; color: #8b949e; margin-top: 8px; line-height: 1.6;">State-of-the-art incubation centres, AI research facilities, and robotics hubs.</p>
      </div>

      <div style="background: #161b22; padding: 32px; border-radius: 20px; border: 1px solid #30363d;">
        <div style="width: 48px; height: 48px; background: #8957e5; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px;">💼</div>
        <h3 style="font-size: 20px; font-weight: 800; margin-top: 18px; color: #ffffff;">98%+ Placement Rate</h3>
        <p style="font-size: 14px; color: #8b949e; margin-top: 8px; line-height: 1.6;">Top MNC recruiters including Fortune 500 companies hiring every year.</p>
      </div>
    </div>
  </div>
</section>`,
    variantIndex: 0,
  },
  {
    id: "home-stats",
    title: "Campus Stats & Impact Numbers",
    code: `<section style="background: #090d16; color: #ffffff; padding: 70px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-top: 1px solid rgba(255,255,255,0.08);">
  <div style="max-width: 1100px; margin: 0 auto;">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; text-align: center;">
      <div style="padding: 24px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
        <h3 style="font-size: 46px; font-weight: 900; color: #38bdf8; margin: 0;">15,000+</h3>
        <p style="font-size: 14px; font-weight: 700; color: #94a3b8; margin-top: 6px; text-transform: uppercase;">Active Students</p>
      </div>
      <div style="padding: 24px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
        <h3 style="font-size: 46px; font-weight: 900; color: #4ade80; margin: 0;">450+</h3>
        <p style="font-size: 14px; font-weight: 700; color: #94a3b8; margin-top: 6px; text-transform: uppercase;">Expert Faculty</p>
      </div>
      <div style="padding: 24px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
        <h3 style="font-size: 46px; font-weight: 900; color: #fbbf24; margin: 0;">120+</h3>
        <p style="font-size: 14px; font-weight: 700; color: #94a3b8; margin-top: 6px; text-transform: uppercase;">Global Programs</p>
      </div>
      <div style="padding: 24px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
        <h3 style="font-size: 46px; font-weight: 900; color: #f472b6; margin: 0;">50,000+</h3>
        <p style="font-size: 14px; font-weight: 700; color: #94a3b8; margin-top: 6px; text-transform: uppercase;">Global Alumni</p>
      </div>
    </div>
  </div>
</section>`,
    variantIndex: 0,
  },
  {
    id: "home-programs",
    title: "Featured Academic Programs",
    code: `<section style="background: #0d1117; color: #ffffff; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-top: 1px solid rgba(255,255,255,0.08);">
  <div style="max-width: 1100px; margin: 0 auto;">
    <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
      <div>
        <span style="background: rgba(168,85,247,0.15); color: #c084fc; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 800; border: 1px solid rgba(168,85,247,0.3); text-transform: uppercase;">
          ACADEMIC DEPARTMENTS
        </span>
        <h2 style="font-size: 38px; font-weight: 900; margin-top: 16px; color: #ffffff;">Explore Programs & Courses</h2>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 40px;">
      <div style="background: #161b22; border-radius: 20px; padding: 28px; border: 1px solid #30363d;">
        <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">UNDERGRADUATE</span>
        <h3 style="font-size: 22px; font-weight: 800; margin-top: 8px; color: #ffffff;">B.Tech Computer Science & AI</h3>
        <p style="font-size: 14px; color: #8b949e; margin-top: 8px;">Full 4-year degree covering machine learning, data engineering, and software architecture.</p>
        <button style="margin-top: 20px; padding: 10px 20px; background: #238636; color: #ffffff; border: none; border-radius: 10px; font-size: 13px; font-weight: 800; cursor: pointer;">Learn More ➔</button>
      </div>

      <div style="background: #161b22; border-radius: 20px; padding: 28px; border: 1px solid #30363d;">
        <span style="font-size: 11px; font-weight: 800; color: #a855f7; text-transform: uppercase;">POSTGRADUATE</span>
        <h3 style="font-size: 22px; font-weight: 800; margin-top: 8px; color: #ffffff;">MBA International Business</h3>
        <p style="font-size: 14px; color: #8b949e; margin-top: 8px;">2-year executive program with global immersion trips and industry mentorship.</p>
        <button style="margin-top: 20px; padding: 10px 20px; background: #8957e5; color: #ffffff; border: none; border-radius: 10px; font-size: 13px; font-weight: 800; cursor: pointer;">Learn More ➔</button>
      </div>

      <div style="background: #161b22; border-radius: 20px; padding: 28px; border: 1px solid #30363d;">
        <span style="font-size: 11px; font-weight: 800; color: #f59e0b; text-transform: uppercase;">RESEARCH / PHD</span>
        <h3 style="font-size: 22px; font-weight: 800; margin-top: 8px; color: #ffffff;">Doctoral Fellowships</h3>
        <p style="font-size: 14px; color: #8b949e; margin-top: 8px;">Fully funded research positions with monthly stipends and international publication support.</p>
        <button style="margin-top: 20px; padding: 10px 20px; background: #d97706; color: #ffffff; border: none; border-radius: 10px; font-size: 13px; font-weight: 800; cursor: pointer;">Learn More ➔</button>
      </div>
    </div>
  </div>
</section>`,
    variantIndex: 0,
  },
  {
    id: "home-footer",
    title: "Footer & Contact Information",
    code: `<footer style="background: #050810; color: #ffffff; padding: 60px 24px 40px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-top: 1px solid rgba(255,255,255,0.1);">
  <div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 40px;">
    <div>
      <h3 style="font-size: 20px; font-weight: 900; color: #ffffff; margin: 0;">Greenfield University</h3>
      <p style="font-size: 13px; color: #64748b; margin-top: 12px; line-height: 1.6;">Empowering future leaders through education, innovation, and global collaboration.</p>
    </div>
    <div>
      <h4 style="font-size: 14px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 0;">Quick Links</h4>
      <ul style="list-style: none; padding: 0; margin: 12px 0 0 0; font-size: 13px; color: #cbd5e1; display: flex; flex-direction: column; gap: 8px;">
        <li><a href="/home" style="color: #cbd5e1; text-decoration: none;">Home</a></li>
        <li><a href="/about" style="color: #cbd5e1; text-decoration: none;">About Us</a></li>
        <li><a href="/academics" style="color: #cbd5e1; text-decoration: none;">Academics</a></li>
        <li><a href="/admissions" style="color: #cbd5e1; text-decoration: none;">Admissions</a></li>
      </ul>
    </div>
    <div>
      <h4 style="font-size: 14px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 0;">Contact Campus</h4>
      <p style="font-size: 13px; color: #cbd5e1; margin-top: 12px; line-height: 1.6;">
        📍 Main Campus, University Road<br />
        ✉️ admissions@greenfield.edu.in<br />
        📞 +91 (080) 2345-6789
      </p>
    </div>
  </div>
  <div style="max-width: 1100px; margin: 40px auto 0 auto; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 12px; color: #64748b;">
    © 2026 Greenfield University. Powered by XITE Website Builder.
  </div>
</footer>`,
    variantIndex: 0,
  },
];

const getSharedHeader = (collegeName: string = "MEC ENGINEERING COLLEGE") => `<header style="background: #0d1527; color: #ffffff; padding: 16px 24px; font-family: system-ui, -apple-system, sans-serif; width: 100%; box-sizing: border-box; border-bottom: 1px solid rgba(255,255,255,0.1); position: relative; z-index: 100;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
        <img src="https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80" alt="College Emblem" data-logo="true" style="width: 42px; height: 42px; object-fit: cover; border-radius: 10px; background: #ffffff; padding: 2px; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;" title="Right-click to change logo image!" />
        <div>
          <span style="font-size: 18px; font-weight: 900; color: #ffffff; display: block; line-height: 1.2; white-space: nowrap;">${collegeName.toUpperCase()}</span>
          <span style="font-size: 11px; font-weight: 600; color: #94a3b8; white-space: nowrap;">Autonomous • NAAC A++ Accredited</span>
        </div>
      </div>

      <nav class="desktop-nav-links" style="display: flex; align-items: center; gap: clamp(8px, 1.8vw, 24px); font-size: 14px; font-weight: 700; flex-wrap: nowrap;">
        <a href="/home" style="color: #cbd5e1; text-decoration: none; white-space: nowrap;">Home</a>
        <a href="/about" style="color: #cbd5e1; text-decoration: none; white-space: nowrap;">About Us</a>
        <a href="/academics" style="color: #cbd5e1; text-decoration: none; white-space: nowrap;">Academics & Courses</a>
        <a href="/admissions" style="color: #cbd5e1; text-decoration: none; white-space: nowrap;">Admissions</a>
        <a href="/placements" style="color: #cbd5e1; text-decoration: none; white-space: nowrap;">Placements & Careers</a>
        <a href="/contact" style="color: #cbd5e1; text-decoration: none; white-space: nowrap;">Contact Helpdesk</a>
      </nav>

      <a href="/admissions" class="desktop-apply-btn" style="background: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 800; text-decoration: none; white-space: nowrap; flex-shrink: 0;">Apply Now</a>

      <button class="hamburger-toggle-btn" style="display: none; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #ffffff; padding: 8px 14px; border-radius: 8px; font-size: 20px; cursor: pointer; align-items: center; justify-content: center;" aria-label="Toggle Navigation Menu">
        ☰
      </button>
    </div>

    <div class="mobile-drawer-menu" style="display: none; width: 100%; background: #0b1120; border-top: 1px solid rgba(255,255,255,0.1); padding: 16px 20px; margin-top: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <nav style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700;">
        <a href="/home" style="color: #ffffff; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Home</a>
        <a href="/about" style="color: #cbd5e1; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">About Us</a>
        <a href="/academics" style="color: #cbd5e1; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Academics & Courses</a>
        <a href="/admissions" style="color: #cbd5e1; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Admissions</a>
        <a href="/placements" style="color: #cbd5e1; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Placements & Careers</a>
        <a href="/contact" style="color: #cbd5e1; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Contact Helpdesk</a>
      </nav>
    </div>

    <style>
      @media (max-width: 900px) {
        .desktop-nav-links { display: none !important; }
        .desktop-apply-btn { display: inline-flex !important; font-size: 12px !important; padding: 6px 12px !important; margin-left: auto !important; }
        .hamburger-toggle-btn { display: inline-flex !important; font-size: 18px !important; padding: 6px 10px !important; margin-left: 4px !important; }
        .mobile-drawer-menu.active { display: block !important; width: 100% !important; }
      }
      @media (min-width: 901px) {
        .hamburger-toggle-btn, .mobile-drawer-menu { display: none !important; }
        .desktop-nav-links { display: flex !important; }
        .desktop-apply-btn { display: inline-block !important; }
      }
    </style>
  </header>`;

const getSharedFooter = (collegeName: string = "MEC ENGINEERING COLLEGE") => `<footer style="background: #050810; color: #ffffff; padding: 60px 24px 40px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-top: 1px solid rgba(255,255,255,0.1);">
  <div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 40px;">
    <div>
      <h3 style="font-size: 20px; font-weight: 900; color: #ffffff; margin: 0;">${collegeName}</h3>
      <p style="font-size: 13px; color: #64748b; margin-top: 12px; line-height: 1.6;">Empowering future leaders through education, innovation, and global collaboration.</p>
    </div>
    <div>
      <h4 style="font-size: 14px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 0;">Quick Links</h4>
      <ul style="list-style: none; padding: 0; margin: 12px 0 0 0; font-size: 13px; color: #cbd5e1; display: flex; flex-direction: column; gap: 8px;">
        <li><a href="/home" style="color: #cbd5e1; text-decoration: none;">Home</a></li>
        <li><a href="/about" style="color: #cbd5e1; text-decoration: none;">About Us</a></li>
        <li><a href="/academics" style="color: #cbd5e1; text-decoration: none;">Academics</a></li>
        <li><a href="/admissions" style="color: #cbd5e1; text-decoration: none;">Admissions</a></li>
      </ul>
    </div>
    <div>
      <h4 style="font-size: 14px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 0;">Contact Campus</h4>
      <p style="font-size: 13px; color: #cbd5e1; margin-top: 12px; line-height: 1.6;">
        📍 Main Campus, College Road<br />
        ✉️ admissions@mec.edu.in<br />
        📞 +91 (044) 2345-6789
      </p>
    </div>
  </div>
  <div style="max-width: 1100px; margin: 40px auto 0 auto; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 12px; color: #64748b;">
    © 2026 ${collegeName}. All Rights Reserved.
  </div>
</footer>`;

const getFullPageSections = (slug: string, pageName: string = "Home", collegeName: string = "MEC ENGINEERING COLLEGE"): SectionItem[] => {
  const cleanSlug = slug.replace(/^\//, "").toLowerCase();
  const sharedHeader = getSharedHeader(collegeName);
  const sharedFooter = getSharedFooter(collegeName);

  if (cleanSlug === "about") {
    return [
      { id: "about-header", title: "Navbar / Header", code: sharedHeader, variantIndex: 0 },
      { id: "about-hero", title: "About Banner", code: `<section style="background: #090d16; color: #ffffff; padding: 80px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 900px; margin: 0 auto;"><span style="background: rgba(56,189,248,0.15); color: #38bdf8; padding: 6px 18px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase;">OUR HERITAGE & VISION</span><h1 style="font-size: 48px; font-weight: 900; margin-top: 20px;">About ${collegeName}</h1><p style="font-size: 17px; color: #94a3b8; margin-top: 16px; line-height: 1.7;">Founded with a commitment to academic rigor, technological innovation, and societal impact for over 4 decades.</p></div></section>`, variantIndex: 0 },
      { id: "about-heritage", title: "Key Accreditations & Heritage", code: `<section style="background: #0f172a; color: #ffffff; padding: 70px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px;"><div style="background: #1e293b; padding: 32px; border-radius: 20px; border: 1px solid #334155;"><h3 style="font-size: 22px; font-weight: 900; color: #38bdf8;">NIRF Top 20</h3><p style="font-size: 14px; color: #94a3b8; margin-top: 10px;">Consistently ranked among the top engineering institutions nationwide.</p></div><div style="background: #1e293b; padding: 32px; border-radius: 20px; border: 1px solid #334155;"><h3 style="font-size: 22px; font-weight: 900; color: #4ade80;">NAAC A++ Grade</h3><p style="font-size: 14px; color: #94a3b8; margin-top: 10px;">Highest national accreditation grade for infrastructure & quality education.</p></div><div style="background: #1e293b; padding: 32px; border-radius: 20px; border: 1px solid #334155;"><h3 style="font-size: 22px; font-weight: 900; color: #c084fc;">100+ Global MOUs</h3><p style="font-size: 14px; color: #94a3b8; margin-top: 10px;">International student exchange and joint research partnerships with top foreign universities.</p></div></div></section>`, variantIndex: 0 },
      { id: "about-footer", title: "Footer", code: sharedFooter, variantIndex: 0 }
    ];
  }

  if (cleanSlug === "academics" || cleanSlug === "courses") {
    return [
      { id: "academics-header", title: "Navbar / Header", code: sharedHeader, variantIndex: 0 },
      { id: "academics-hero", title: "Academics Banner", code: `<section style="background: #090d16; color: #ffffff; padding: 80px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 900px; margin: 0 auto;"><span style="background: rgba(168,85,247,0.15); color: #c084fc; padding: 6px 18px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase;">ACADEMIC EXCELLENCE</span><h1 style="font-size: 48px; font-weight: 900; margin-top: 20px;">Degree Programs & Courses</h1><p style="font-size: 17px; color: #94a3b8; margin-top: 16px; line-height: 1.7;">Offering industry-aligned Undergraduate, Postgraduate, and PhD degrees designed for global careers.</p></div></section>`, variantIndex: 0 },
      { id: "academics-list", title: "Offered Programs", code: `<section style="background: #0d1117; color: #ffffff; padding: 70px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;"><div style="background: #161b22; border-radius: 20px; padding: 32px; border: 1px solid #30363d;"><h3 style="font-size: 24px; font-weight: 900; color: #38bdf8;">B.Tech Computer Science & AI</h3><p style="font-size: 14px; color: #8b949e; margin-top: 10px;">4-year degree covering AI/ML algorithms, cloud computing, and software development.</p></div><div style="background: #161b22; border-radius: 20px; padding: 32px; border: 1px solid #30363d;"><h3 style="font-size: 24px; font-weight: 900; color: #a855f7;">B.Tech Electronics & Robotics</h3><p style="font-size: 14px; color: #8b949e; margin-top: 10px;">Specialized training in embedded systems, IoT sensors, and autonomous robotics.</p></div><div style="background: #161b22; border-radius: 20px; padding: 32px; border: 1px solid #30363d;"><h3 style="font-size: 24px; font-weight: 900; color: #f59e0b;">MBA Tech Management</h3><p style="font-size: 14px; color: #8b949e; margin-top: 10px;">2-year postgraduate program blending technology leadership and business strategy.</p></div></div></section>`, variantIndex: 0 },
      { id: "academics-footer", title: "Footer", code: sharedFooter, variantIndex: 0 }
    ];
  }

  if (cleanSlug === "admissions") {
    return [
      { id: "admissions-header", title: "Navbar / Header", code: sharedHeader, variantIndex: 0 },
      { id: "admissions-hero", title: "Admissions Banner", code: `<section style="background: #090d16; color: #ffffff; padding: 80px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 900px; margin: 0 auto;"><span style="background: rgba(37,99,235,0.2); color: #60a5fa; padding: 6px 18px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase;">ADMISSIONS OPEN 2026</span><h1 style="font-size: 48px; font-weight: 900; margin-top: 20px;">Join ${collegeName}</h1><p style="font-size: 17px; color: #94a3b8; margin-top: 16px; line-height: 1.7;">Step into a world of innovation, research, and top-tier global placement opportunities.</p><div style="margin-top: 28px;"><a href="#apply" style="background: #2563eb; color: #ffffff; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 900; text-decoration: none;">Submit Application</a></div></div></section>`, variantIndex: 0 },
      { id: "admissions-steps", title: "Application Process", code: `<section style="background: #0f172a; color: #ffffff; padding: 70px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; text-align: center;"><div style="background: #1e293b; padding: 28px; border-radius: 20px; border: 1px solid #334155;"><div style="font-size: 32px; font-weight: 900; color: #38bdf8;">1</div><h4 style="font-size: 18px; font-weight: 800; margin-top: 10px;">Fill Online Form</h4><p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Register online and enter your academic details.</p></div><div style="background: #1e293b; padding: 28px; border-radius: 20px; border: 1px solid #334155;"><div style="font-size: 32px; font-weight: 900; color: #38bdf8;">2</div><h4 style="font-size: 18px; font-weight: 800; margin-top: 10px;">Entrance Test</h4><p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Appear for national or university entrance exam.</p></div><div style="background: #1e293b; padding: 28px; border-radius: 20px; border: 1px solid #334155;"><div style="font-size: 32px; font-weight: 900; color: #38bdf8;">3</div><h4 style="font-size: 18px; font-weight: 800; margin-top: 10px;">Counseling & Seat</h4><p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Attend counseling session and confirm enrollment.</p></div></div></section>`, variantIndex: 0 },
      { id: "admissions-footer", title: "Footer", code: sharedFooter, variantIndex: 0 }
    ];
  }

  if (cleanSlug === "placements") {
    return [
      { id: "placements-header", title: "Navbar / Header", code: sharedHeader, variantIndex: 0 },
      { id: "placements-hero", title: "Placements Banner", code: `<section style="background: #090d16; color: #ffffff; padding: 80px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 900px; margin: 0 auto;"><span style="background: rgba(34,197,94,0.2); color: #4ade80; padding: 6px 18px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase;">98.4% PLACEMENT RECORD</span><h1 style="font-size: 48px; font-weight: 900; margin-top: 20px;">Placements & Career Opportunities</h1><p style="font-size: 17px; color: #94a3b8; margin-top: 16px; line-height: 1.7;">Highest Package: 50 LPA+ | 300+ Fortune 500 Recruiters Visiting Annually</p></div></section>`, variantIndex: 0 },
      { id: "placements-stats", title: "Placement Statistics", code: `<section style="background: #0f172a; color: #ffffff; padding: 70px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; text-align: center;"><div style="padding: 28px; background: #1e293b; border-radius: 20px; border: 1px solid #334155;"><h3 style="font-size: 42px; font-weight: 900; color: #4ade80; margin: 0;">50 LPA</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Highest Package</p></div><div style="padding: 28px; background: #1e293b; border-radius: 20px; border: 1px solid #334155;"><h3 style="font-size: 42px; font-weight: 900; color: #38bdf8; margin: 0;">12.5 LPA</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Average Package</p></div><div style="padding: 28px; background: #1e293b; border-radius: 20px; border: 1px solid #334155;"><h3 style="font-size: 42px; font-weight: 900; color: #fbbf24; margin: 0;">300+</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Recruiting MNCs</p></div></div></section>`, variantIndex: 0 },
      { id: "placements-footer", title: "Footer", code: sharedFooter, variantIndex: 0 }
    ];
  }

  if (cleanSlug === "contact") {
    return [
      { id: "contact-header", title: "Navbar / Header", code: sharedHeader, variantIndex: 0 },
      { id: "contact-hero", title: "Contact Banner", code: `<section style="background: #090d16; color: #ffffff; padding: 80px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 900px; margin: 0 auto;"><span style="background: rgba(37,99,235,0.2); color: #60a5fa; padding: 6px 18px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase;">CAMPUS HELPDESK</span><h1 style="font-size: 48px; font-weight: 900; margin-top: 20px;">Contact ${collegeName}</h1><p style="font-size: 17px; color: #94a3b8; margin-top: 16px;">Have questions? Reach out to our admissions team or visit our main campus.</p></div></section>`, variantIndex: 0 },
      { id: "contact-form", title: "Enquiry Form & Campus Details", code: `<section style="background: #0f172a; color: #ffffff; padding: 70px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;"><div style="background: #1e293b; padding: 36px; border-radius: 24px; border: 1px solid #334155;"><h3 style="font-size: 22px; font-weight: 900; margin-top: 0;">Send Us a Message</h3><div style="display: flex; flex-direction: column; gap: 16px; margin-top: 20px;"><input type="text" placeholder="Your Full Name" style="width: 100%; padding: 14px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; color: #ffffff; font-size: 14px;" /><input type="email" placeholder="Your Email Address" style="width: 100%; padding: 14px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; color: #ffffff; font-size: 14px;" /><textarea placeholder="Your Message or Admission Query" rows="4" style="width: 100%; padding: 14px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; color: #ffffff; font-size: 14px;"></textarea><button style="background: #2563eb; color: #ffffff; padding: 14px; border-radius: 12px; font-weight: 900; font-size: 14px; border: none; cursor: pointer;">Submit Inquiry</button></div></div><div style="display: flex; flex-direction: column; justify-content: center; gap: 24px;"><div><h4 style="font-size: 16px; font-weight: 800; color: #38bdf8; margin: 0;">📍 Campus Address</h4><p style="font-size: 14px; color: #94a3b8; margin-top: 6px; line-height: 1.6;">Main Institutional Campus, University Road, Tech City, Pin: 600028</p></div><div><h4 style="font-size: 16px; font-weight: 800; color: #38bdf8; margin: 0;">📞 Helpline & Email</h4><p style="font-size: 14px; color: #94a3b8; margin-top: 6px; line-height: 1.6;">Phone: +91 (044) 2345-6789<br />Email: admissions@mec.edu.in</p></div></div></div></section>`, variantIndex: 0 },
      { id: "contact-footer", title: "Footer", code: sharedFooter, variantIndex: 0 }
    ];
  }

  // Default Home Page (Full 5-Section Web Page)
  return [
    { id: "home-header", title: "Navbar / Header", code: sharedHeader, variantIndex: 0 },
    { id: "home-hero", title: "Home Banner", code: `<section style="background: #090d16; color: #ffffff; padding: 90px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 950px; margin: 0 auto;"><span style="background: rgba(37,99,235,0.2); border: 1px solid #2563eb; color: #60a5fa; padding: 6px 20px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase;">Admission Portal 2026 • NEW</span><h1 style="font-size: 52px; font-weight: 900; margin-top: 24px; line-height: 1.1; color: #ffffff;">Build Your Career at ${collegeName}</h1><p style="font-size: 18px; color: #94a3b8; margin-top: 18px; line-height: 1.6; max-width: 720px; margin-left: auto; margin-right: auto;">Experience world-class technological education with advanced AI/ML research labs, top-tier global faculty, and 100% placement assurance with industry leaders.</p><div style="margin-top: 36px; display: flex; justify-content: center; gap: 16px;"><a href="/admissions" style="background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none;">Apply For Admission ➔</a><a href="/contact" style="background: transparent; border: 1px solid #334155; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none;">Campus Video</a></div></div></section>`, variantIndex: 0 },
    { id: "home-stats", title: "Campus Highlights & Stats", code: `<section style="background: #0f172a; color: #ffffff; padding: 60px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; text-align: center;"><div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">50 LPA+</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Highest CTC Offered</p></div><div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #4ade80; margin: 0;">300+</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Hiring Companies</p></div><div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #fbbf24; margin: 0;">NAAC A++</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Grade Accreditation</p></div><div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #f472b6; margin: 0;">15,000+</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Active Students</p></div></div></section>`, variantIndex: 0 },
    { id: "home-programs", title: "Featured Programs", code: `<section style="background: #0d1117; color: #ffffff; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;"><div style="max-width: 1100px; margin: 0 auto;"><div style="text-align: center;"><span style="background: rgba(168,85,247,0.15); color: #c084fc; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase;">ACADEMIC DEPARTMENTS</span><h2 style="font-size: 38px; font-weight: 900; margin-top: 16px; color: #ffffff;">Explore Degrees & Courses</h2></div><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 40px;"><div style="background: #161b22; border-radius: 20px; padding: 28px; border: 1px solid #30363d;"><h3 style="font-size: 22px; font-weight: 800; color: #ffffff;">B.Tech Computer Science & AI</h3><p style="font-size: 14px; color: #8b949e; margin-top: 8px;">Full 4-year degree covering machine learning, data engineering, and software architecture.</p></div><div style="background: #161b22; border-radius: 20px; padding: 28px; border: 1px solid #30363d;"><h3 style="font-size: 22px; font-weight: 800; color: #ffffff;">MBA International Business</h3><p style="font-size: 14px; color: #8b949e; margin-top: 8px;">2-year executive program with global immersion trips and industry mentorship.</p></div><div style="background: #161b22; border-radius: 20px; padding: 28px; border: 1px solid #30363d;"><h3 style="font-size: 22px; font-weight: 800; color: #ffffff;">Doctoral Fellowships</h3><p style="font-size: 14px; color: #8b949e; margin-top: 8px;">Fully funded research positions with monthly stipends and international publication support.</p></div></div></div></section>`, variantIndex: 0 },
    { id: "home-footer", title: "Footer", code: sharedFooter, variantIndex: 0 }
  ];
};

interface EditorStudioProps {
  subdomain?: string;
  collegeName?: string;
}

export function EditorStudio({
  subdomain = "greenfield",
  collegeName = "Greenfield University",
}: EditorStudioProps) {
  const [viewportWidth, setViewportWidth] = useState<string>("100%");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string>("domain");
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [historyStack, setHistoryStack] = useState<SectionItem[][]>([]);
  const [redoStack, setRedoStack] = useState<SectionItem[][]>([]);
  const [adminDbTemplates, setAdminDbTemplates] = useState<any[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(0);
  const [loadingDb, setLoadingDb] = useState(true);

  // Check if user has explicitly logged out
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("xite_user_logged_out") === "true") {
        window.location.href = "/login";
      }
    }
  }, []);

  // Helper to record history snapshot before mutating sections state
  const setSectionsWithHistory: React.Dispatch<React.SetStateAction<SectionItem[]>> = (action) => {
    setSections((prevSections) => {
      const nextSections = typeof action === "function" ? action(prevSections) : action;
      if (JSON.stringify(prevSections) !== JSON.stringify(nextSections)) {
        setHistoryStack((history) => [...history.slice(-49), prevSections]);
        setRedoStack([]);
      }
      return nextSections;
    });
  };

  // Undo & Redo History Stack Handlers (Applies to Text Edits & Page Sections)
  const handleUndo = () => {
    if (typeof document !== "undefined" && document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    if (historyStack.length === 0) {
      showToastNotification("ℹ️ At initial state (No earlier history)");
      return;
    }
    const previousState = historyStack[historyStack.length - 1]!;
    setRedoStack((prev) => [...prev, sections]);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setSections(previousState);
    showToastNotification("↩️ Undo performed!");
  };

  const handleRedo = () => {
    if (typeof document !== "undefined" && document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    if (redoStack.length === 0) {
      showToastNotification("ℹ️ At latest state (No redo history)");
      return;
    }
    const nextState = redoStack[redoStack.length - 1]!;
    setHistoryStack((prev) => [...prev, sections]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setSections(nextState);
    showToastNotification("↪️ Redo performed!");
  };

  // Global Keyboard Shortcuts for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;

      // Ignore shortcut only if user is typing inside form inputs / textareas
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
        return;
      }

      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrCmd && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (ctrlOrCmd && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyStack, redoStack, sections]);

  // Section Selector Modal
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  // Right-Click Link / Button Navigation Popup State
  const [linkPopup, setLinkPopup] = useState<{
    x: number;
    y: number;
    sectionIndex: number;
    targetElement: HTMLElement;
    currentUrl: string;
    isNewTab: boolean;
  } | null>(null);

  // Dynamic Toast Notification State (Disabled per user request)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToastNotification = (_msg: string) => {
    // Popups completely disabled per user request
    setToastMessage(null);
  };

  // Right-Click Image, Logo & Background Editor Modal State
  const [imagePopup, setImagePopup] = useState<{
    x: number;
    y: number;
    sectionIndex: number;
    targetElement: HTMLElement;
    targetType: "logo" | "image" | "background";
    logoText: string;
    bgColor: string;
    imageUrl: string;
    originalUrl: string;
    linkUrl: string;
    applyAllLogos: boolean;
    applyAllBackgrounds: boolean;
    activeTab: "logo" | "background" | "image" | "style";
    objectFit: "cover" | "contain" | "fill";
    borderRadius: string;
  } | null>(null);

  // Right-Click Map & Location Editor Modal State
  const [mapPopup, setMapPopup] = useState<{
    sectionIndex: number;
    mapEmbedUrl: string;
    directionsUrl: string;
    locationName: string;
  } | null>(null);

  // Backward compatibility alias for legacy logoPopup state access
  const logoPopup = imagePopup;
  const setLogoPopup = (val: any) => {
    if (!val) {
      setImagePopup(null);
      return;
    }
    setImagePopup((prev) => (prev ? { ...prev, ...val } : val));
  };

  const [_activePalette, setActivePalette] = useState("academic-blue");
  const [_activeFont, setActiveFont] = useState("inter");

  // Strip out canvas wrapper divs and html entity pollution while preserving section CSS & style tags
  const cleanCanvasWrapperFromCode = (rawCode: string): string => {
    if (!rawCode) return "";

    let clean = rawCode;

    // 1. Remove mobile drawer overlays & hamburger buttons injected dynamically
    clean = clean.replace(/<div[^>]*class="[^"]*mobile-drawer-menu[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
    clean = clean.replace(/<button[^>]*class="[^"]*hamburger-toggle-btn[^"]*"[^>]*>[\s\S]*?<\/button>/gi, "");

    // 2. Un-escape HTML entities if present (&lt;, &gt;, &amp;)
    clean = clean.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

    // 3. Strip outer wrapper divs injected by canvas (.section-canvas-box, .section-wrapper-container)
    clean = clean.replace(/^<div[^>]*class="[^"]*(?:section-canvas-box|section-wrapper-container)[^"]*"[^>]*>([\s\S]*)<\/div>$/i, (_match, inner) => {
      return inner ? inner.trim() : _match;
    });

    return clean.trim();
  };

  // Handle full-page Color Theme Palette Switch across ALL sections
  const handlePaletteSelect = (paletteId: string) => {
    setActivePalette(paletteId);

    const PALETTES_MAP: Record<string, { primary: string; secondary: string; accent: string; headerBg: string; textAccent: string }> = {
      "academic-blue": { primary: "#0f172a", secondary: "#1e293b", accent: "#2563eb", headerBg: "#0d1527", textAccent: "#38bdf8" },
      "emerald-gold": { primary: "#022c22", secondary: "#064e3b", accent: "#f59e0b", headerBg: "#022c22", textAccent: "#fbbf24" },
      "crimson-slate": { primary: "#4c0519", secondary: "#881337", accent: "#f43f5e", headerBg: "#4c0519", textAccent: "#fb7185" },
      "midnight-purple": { primary: "#0d0418", secondary: "#180828", accent: "#a855f7", headerBg: "#0d0418", textAccent: "#c084fc" },
      "sunset-amber": { primary: "#18181b", secondary: "#27272a", accent: "#f59e0b", headerBg: "#09090b", textAccent: "#fbbf24" },
      "modern-dark": { primary: "#0b1329", secondary: "#1e293b", accent: "#38bdf8", headerBg: "#0b1329", textAccent: "#7dd3fc" },
      "crimson-gold": { primary: "#3b0764", secondary: "#581c87", accent: "#eab308", headerBg: "#3b0764", textAccent: "#fde047" },
      "cyber-neon": { primary: "#050814", secondary: "#0f172a", accent: "#06b6d4", headerBg: "#050814", textAccent: "#22d3ee" },
      "rose-quartz": { primary: "#1f1924", secondary: "#2d2336", accent: "#f472b6", headerBg: "#1f1924", textAccent: "#f472b6" },
      "light-minimal": { primary: "#ffffff", secondary: "#f8fafc", accent: "#2563eb", headerBg: "#0f172a", textAccent: "#2563eb" },
    };

    const target = PALETTES_MAP[paletteId] || PALETTES_MAP["academic-blue"]!;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(`xite_theme_palette_${subdomain}`, paletteId);
      }
    } catch {}

    // Transform color scheme across ALL sections (Buttons, Cards, Accents, Headers, Footers, Badges)
    setSectionsWithHistory((prevSections) =>
      prevSections.map((sec) => {
        let code = sec.code;
        // Swap button background colors, accent badges & highlights
        code = code
          .replace(/background:\s*#(2563eb|ef4444|000000|0f172a|881337|064e3b|a855f7|f59e0b|06b6d4|eab308|f472b6|f43f5e)/gi, `background: ${target.accent}`)
          .replace(/background-color:\s*#(2563eb|ef4444|000000|0f172a|881337|064e3b|a855f7|f59e0b|06b6d4|eab308|f472b6|f43f5e)/gi, `background-color: ${target.accent}`)
          .replace(/border-color:\s*#(2563eb|ef4444|000000|0f172a|881337|064e3b|a855f7|f59e0b|06b6d4|eab308|f472b6|f43f5e)/gi, `border-color: ${target.accent}`)
          .replace(/color:\s*#(38bdf8|4ade80|fbbf24|c084fc|22d3ee|7dd3fc|fde047|f472b6|60a5fa)/gi, `color: ${target.textAccent}`)
          .replace(/<header style="background:\s*[^;]+;/gi, `<header style="background: ${target.headerBg};`)
          .replace(/<footer style="background:\s*[^;]+;/gi, `<footer style="background: ${target.primary};`);

        return { ...sec, code };
      })
    );
  };

  // Handle full-page Font Family Switch across ALL sections
  const handleFontSelect = (fontId: string) => {
    setActiveFont(fontId);

    const FONT_MAP: Record<string, string> = {
      inter: "'Inter', system-ui, -apple-system, sans-serif",
      outfit: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
      serif: "'Playfair Display', Georgia, serif",
      cormorant: "'Cormorant Garamond', Georgia, serif",
      roboto: "'Roboto', system-ui, sans-serif",
      "space-grotesk": "'Space Grotesk', system-ui, sans-serif",
      "plus-jakarta": "'Plus Jakarta Sans', system-ui, sans-serif",
    };

    const targetFont = FONT_MAP[fontId] || FONT_MAP["inter"]!;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(`xite_theme_font_${subdomain}`, fontId);
      }
    } catch {}

    // Update font-family style attribute across ALL sections and inner elements
    setSectionsWithHistory((prevSections) =>
      prevSections.map((sec) => {
        let code = sec.code;
        code = code.replace(/font-family:\s*[^;]+;/gi, `font-family: ${targetFont};`);
        return { ...sec, code };
      })
    );
  };

  const showToast = (_msg?: string) => {
    // Toast popups completely removed
  };

  // Auto-correct responsive section code and alignment across all viewports
  const autoCorrectMobileCode = (code: string, width: string) => {
    if (!code) return "";
    const isMobile = width === "375px" || width === "425px";
    const isTablet = width === "640px" || width === "768px" || width === "1024px";
    const isResponsiveView = isMobile || isTablet;

    let corrected = code;

    // Inject hamburger button & drawer for headers if missing when in Tablet or Mobile view
    if (isResponsiveView && corrected.includes("<header") && !corrected.includes("hamburger-toggle-btn")) {
      corrected = corrected.replace(/<\/header>/gi, (match) => {
        return `
          <button class="hamburger-toggle-btn" style="display: inline-flex !important; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: #ffffff; padding: 6px 12px; border-radius: 8px; font-size: 20px; cursor: pointer; align-items: center; justify-content: center; position: relative !important; margin-left: 6px !important; flex-shrink: 0 !important; z-index: 10;" aria-label="Toggle Menu">
            ☰
          </button>
          <div class="mobile-drawer-menu" style="display: none; width: 100%; background: #0b1120; border-top: 1px solid rgba(255,255,255,0.1); padding: 16px 20px; margin-top: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); position: relative; z-index: 99;">
            <nav style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700;">
              <a href="/home" style="color: #ffffff; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Home</a>
              <a href="/about" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">About Us</a>
              <a href="/academics" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Academics & Courses</a>
              <a href="/admissions" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Admissions</a>
              <a href="/placements" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Placements & Careers</a>
              <a href="/contact" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Contact Helpdesk</a>
            </nav>
          </div>
        ${match}`;
      });
    } else if (corrected.includes("mobile-drawer-menu")) {
      corrected = corrected.replace(/<div[^>]*class="[^"]*mobile-drawer-menu[^"]*"[^>]*>[\s\S]*?<\/div>/gi, `
        <div class="mobile-drawer-menu" style="display: none; width: 100%; background: #0b1120; border-top: 1px solid rgba(255,255,255,0.1); padding: 16px 20px; margin-top: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); position: relative; z-index: 99;">
          <nav style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700;">
            <a href="/home" style="color: #ffffff; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Home</a>
            <a href="/about" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">About Us</a>
            <a href="/academics" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Academics & Courses</a>
            <a href="/admissions" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Admissions</a>
            <a href="/placements" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Placements & Careers</a>
            <a href="/contact" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Contact Helpdesk</a>
          </nav>
        </div>
      `);
    }

    // Ensure all max-width containers have mx-auto / margin: 0 auto centering
    corrected = corrected.replace(/class="([^"]*max-w-[^"]*)"/gi, (_m, p1) => {
      if (!p1.includes("mx-auto") && !p1.includes("ml-") && !p1.includes("mr-")) {
        return `class="${p1} mx-auto"`;
      }
      return _m;
    });

    if (isTablet) {
      // Auto-correct multi-column layouts for Tablet screens (max 2 columns, scaled text)
      corrected = corrected
        .replace(/grid-template-columns:\s*repeat\(\s*[4-9]\s*,\s*1fr\s*\)/gi, "grid-template-columns: repeat(2, 1fr)")
        .replace(/grid-template-columns:\s*1fr\s+1fr\s+1fr\s+1fr/gi, "grid-template-columns: 1fr 1fr")
        .replace(/font-size:\s*([4-9][0-9])px/gi, (_match, p1) => `font-size: ${Math.min(parseInt(p1, 10), 32)}px`);
    }

    if (isMobile) {
      // Auto-correct multi-column flex/grid containers for Mobile phone screens (1 column)
      corrected = corrected
        .replace(/grid-template-columns:\s*repeat\(\s*[2-9]\s*,\s*1fr\s*\)/gi, "grid-template-columns: repeat(1, 1fr)")
        .replace(/grid-template-columns:\s*1fr\s+1fr\s+1fr/gi, "grid-template-columns: 1fr")
        .replace(/grid-template-columns:\s*repeat\(\s*auto-fit\s*,\s*minmax\([^)]+\)\)/gi, "grid-template-columns: 1fr")
        .replace(/flex-direction:\s*row/gi, "flex-direction: column")
        .replace(/border-r\b/g, "border-b border-r-0")
        .replace(/border-right:[^;]+;/gi, "border-bottom: 1px solid rgba(255,255,255,0.1); border-right: none;")
        .replace(/font-size:\s*([3-9][0-9])px/gi, (_match, p1) => `font-size: ${Math.min(parseInt(p1, 10), 22)}px`);
    }

    return corrected;
  };

  // Parse full web HTML documents (with <!DOCTYPE>, <html>, <head>, <style>, <body>) for canvas rendering
  const cleanFullWebCodeForCanvas = (code: string, width: string): string => {
    if (!code) return "";

    const isResponsiveView = width === "768px" || width === "375px" || width === "425px";

    let cleanCode = code;

    const bodyMatch = code.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      const headMatch = code.match(/<head[\s\S]*?>([\s\S]*?)<\/head>/i);
      const styles = headMatch ? headMatch[1] : "";
      cleanCode = `${styles}\n${bodyMatch[1]}`;
    } else {
      cleanCode = code
        .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
        .replace(/<\/?html[\s\S]*?>/gi, "")
        .replace(/<\/?head[\s\S]*?>/gi, "")
        .replace(/<\/?body[\s\S]*?>/gi, "");
    }

    // Neutralize fixed/sticky positioning in inline HTML so canvas layout stays static & aligned
    cleanCode = cleanCode
      .replace(/position:\s*fixed/gi, "position: relative")
      .replace(/position:\s*sticky/gi, "position: relative");

    const containmentStyles = `<style>
      .section-canvas-box {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        position: relative !important;
        display: block !important;
        font-size: 0 !important;
        line-height: 0 !important;
      }
      .section-canvas-box > * {
        font-size: initial !important;
        line-height: initial !important;
      }
      .section-canvas-box img, .section-canvas-box video, .section-canvas-box iframe, .section-canvas-box svg {
        max-width: 100% !important;
      }
      .section-canvas-box > div,
      .section-canvas-box > header,
      .section-canvas-box > section,
      .section-canvas-box {
        width: 100% !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
        box-sizing: border-box !important;
      }

      .section-canvas-box > *:first-child,
      .section-wrapper-container:first-child,
      .section-wrapper-container:first-child > div,
      .section-wrapper-container:first-child header,
      .section-wrapper-container:first-child section {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }

      .section-canvas-box [style*="position: fixed"], .section-canvas-box [style*="position:fixed"],
      .section-canvas-box [style*="position: sticky"], .section-canvas-box [style*="position:sticky"] {
        position: relative !important;
        top: auto !important;
      }
      
      /* Universal Header Containment - Flush to Top Edge with Zero White Space */
      header, .section-canvas-box header {
        max-width: 100% !important;
        width: 100% !important;
        margin-top: 0 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        border-radius: 0 !important;
        box-sizing: border-box !important;
        position: relative !important;
        top: 0 !important;
      }

      .section-canvas-box header div:first-child span,
      .section-canvas-box header div:first-child a,
      header div:first-child span,
      header div:first-child a {
        font-size: clamp(10px, 1.1vw, 13px) !important;
        white-space: nowrap !important;
      }

      /* Hide crowded utility links on mobile phone viewports so top bar stays 1 line */
      ${width === "375px" ? `
        .section-canvas-box header div:first-child:not(:only-child) > div:last-child,
        header div:first-child:not(:only-child) > div:last-child {
          display: none !important;
        }
      ` : ''}

      .section-canvas-box .mobile-drawer-menu,
      header .mobile-drawer-menu {
        width: 100% !important;
        flex-basis: 100% !important;
        clear: both !important;
        margin-top: 12px !important;
        position: relative !important;
        left: 0 !important;
        right: 0 !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
        z-index: 99 !important;
      }

      ${isResponsiveView ? `
        /* Forced Tablet & Mobile Rules when responsive viewport selected in Editor */
        .section-canvas-box header nav:not(.mobile-drawer-menu nav),
        .section-canvas-box header ul:not(.mobile-drawer-menu ul),
        .section-canvas-box header .desktop-nav-links,
        header nav:not(.mobile-drawer-menu nav),
        header ul:not(.mobile-drawer-menu ul),
        header .desktop-nav-links {
          display: none !important;
        }

        .section-canvas-box header > div,
        header > div {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 8px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .section-canvas-box header .desktop-apply-btn,
        .section-canvas-box header a.desktop-apply-btn,
        .section-canvas-box header button.desktop-apply-btn,
        header .desktop-apply-btn,
        header a.desktop-apply-btn,
        header button.desktop-apply-btn,
        header a[href*="apply"],
        header a[href*="admissions"] {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 6px 14px !important;
          font-size: 12px !important;
          font-weight: 800 !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          position: relative !important;
          top: auto !important;
          transform: none !important;
          margin-left: auto !important;
          margin-right: 4px !important;
        }

        .section-canvas-box .hamburger-toggle-btn,
        header .hamburger-toggle-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 6px 12px !important;
          border-radius: 8px !important;
          font-size: 20px !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
          position: relative !important;
          top: auto !important;
          transform: none !important;
          margin-left: 0 !important;
        }

        .section-canvas-box .mobile-drawer-menu.active,
        header .mobile-drawer-menu.active {
          display: block !important;
          width: 100% !important;
          flex-basis: 100% !important;
          clear: both !important;
        }
      ` : `
        /* Mobile & Tablet Viewport Rules (<= 900px: Phone 375px & Tablet 768px) */
        @media (max-width: 900px) {
          .section-canvas-box header nav:not(.mobile-drawer-menu nav),
          .section-canvas-box header ul:not(.mobile-drawer-menu ul),
          .section-canvas-box header .desktop-nav-links,
          header nav:not(.mobile-drawer-menu nav),
          header ul:not(.mobile-drawer-menu ul),
          header .desktop-nav-links {
            display: none !important;
          }

          .section-canvas-box header > div,
          header > div {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .section-canvas-box header .desktop-apply-btn,
          .section-canvas-box header a.desktop-apply-btn,
          .section-canvas-box header button.desktop-apply-btn,
          header .desktop-apply-btn,
          header a.desktop-apply-btn,
          header button.desktop-apply-btn,
          header a[href*="apply"],
          header a[href*="admissions"] {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 6px 14px !important;
            font-size: 12px !important;
            font-weight: 800 !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            position: relative !important;
            top: auto !important;
            transform: none !important;
            margin-left: auto !important;
            margin-right: 4px !important;
          }

          .section-canvas-box .hamburger-toggle-btn,
          header .hamburger-toggle-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 6px 12px !important;
            border-radius: 8px !important;
            font-size: 20px !important;
            cursor: pointer !important;
            flex-shrink: 0 !important;
            position: relative !important;
            top: auto !important;
            transform: none !important;
            margin-left: 0 !important;
          }

          .section-canvas-box .mobile-drawer-menu.active,
          header .mobile-drawer-menu.active {
            display: block !important;
            width: 100% !important;
            flex-basis: 100% !important;
            clear: both !important;
          }
        }

        /* Desktop Viewport Rules (> 900px) */
        @media (min-width: 901px) {
          .section-canvas-box .hamburger-toggle-btn,
          .section-canvas-box .mobile-drawer-menu,
          header .hamburger-toggle-btn,
          header .mobile-drawer-menu {
            display: none !important;
          }
          .section-canvas-box .desktop-nav-links,
          header nav, header .desktop-nav-links, header ul {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: clamp(4px, 1.2vw, 16px) !important;
            min-width: 0 !important;
          }
          .section-canvas-box .desktop-nav-links a,
          header nav a, header .desktop-nav-links a, header ul a {
            white-space: nowrap !important;
            font-size: clamp(11px, 1.05vw, 14px) !important;
            line-height: 1.2 !important;
          }
          .section-canvas-box .desktop-apply-btn,
          header a[style*="background"], header button[style*="background"], header .desktop-apply-btn {
            display: inline-block !important;
            flex-shrink: 0 !important;
            white-space: nowrap !important;
          }
        }
      `}
    </style>`;

    return `<div class="section-canvas-box">${containmentStyles}${autoCorrectMobileCode(cleanCode, width)}</div>`;
  };

  // Active Page State
  const [currentPage, setCurrentPage] = useState({ name: "Home", slug: "/home" });

  // Per-Page Persistent Auto-Save Store
  const [pageStore, setPageStore] = useState<Record<string, SectionItem[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("xite_saved_pages");
        if (saved && saved !== "undefined" && saved !== "null") {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Could not parse xite_saved_pages from localStorage:", e);
      }
    }
    return {};
  });

  // Auto-save active sections to pageStore & localStorage whenever sections update
  useEffect(() => {
    if (sections.length > 0 && currentPage.slug) {
      setPageStore((prev) => {
        const updated = { ...prev, [currentPage.slug]: sections };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("xite_saved_pages", JSON.stringify(updated));
            localStorage.setItem(`xite_active_sections_${subdomain}`, JSON.stringify(sections));
          } catch {}
        }
        return updated;
      });
    }
  }, [sections, currentPage.slug]);

  // Helper to normalize category key aliases across Admin DB templates & Editor categories
  const normalizeCategory = (cat?: string): string => {
    if (!cat) return "";
    const c = cat.toLowerCase().trim();
    if (c.includes("header") || c.includes("navbar") || c === "nav") return "navbar";
    if (c.includes("hero") || c.includes("banner") || c.includes("masthead")) return "hero";
    if (c.includes("highlight") || c.includes("stat") || c.includes("metric")) return "highlights";
    if (c.includes("about")) return "about";
    if (c.includes("vision") || c.includes("mission") || c.includes("principle")) return "vision";
    if (c.includes("course") || c.includes("program") || c.includes("degree")) return "courses";
    if (c.includes("department") || c.includes("faculty") || c.includes("school")) return "departments";
    if (c.includes("admission") || c.includes("apply") || c.includes("eligibility")) return "admissions";
    if (c.includes("placement") || c.includes("recruiter") || c.includes("career")) return "placements";
    if (c.includes("facilit") || c.includes("infrastruct") || c.includes("hostel") || c.includes("library")) return "facilities";
    if (c.includes("research") || c.includes("patent") || c.includes("r&d") || c.includes("lab")) return "research";
    if (c.includes("news") || c.includes("circular") || c.includes("announc") || c.includes("notice")) return "news";
    if (c.includes("event") || c.includes("calendar") || c.includes("fest")) return "events";
    if (c.includes("gallery") || c.includes("campus life") || c.includes("photo")) return "gallery";
    if (c.includes("testimonial") || c.includes("alumni") || c.includes("review")) return "testimonials";
    if (c.includes("award") || c.includes("achievement") || c.includes("rank") || c.includes("trophy")) return "achievements";
    if (c.includes("contact") || c.includes("enquir") || c.includes("inquir") || c.includes("helpdesk")) return "contact";
    if (c.includes("map") || c.includes("location") || c.includes("direction")) return "map";
    if (c.includes("footer") || c.includes("copyright")) return "footer";
    return c;
  };

  // Live Admin templates map state
  const [liveAdminTemplatesMap, setLiveAdminTemplatesMap] = useState<Record<string, string>>({});

  // Sanitizer to guarantee VIT University style dark navbar
  const sanitizeHeaderCode = (code: string): string => {
    if (!code || !code.includes("VELLORE INSTITUTE OF TECHNOLOGY")) {
      return ALL_19_SECTION_TEMPLATES.navbar;
    }
    return code;
  };

  const getAll19DefaultSections = (slug: string = "/home"): SectionItem[] => {
    const cleanSlug = slug.replace(/^\//, "").toLowerCase() || "home";
    return SECTION_CATEGORIES.map((cat, idx) => {
      const normCat = normalizeCategory(cat.id);
      const liveCode =
        liveAdminTemplatesMap[cat.id.toLowerCase()] ||
        liveAdminTemplatesMap[normCat] ||
        liveAdminTemplatesMap[`def-${cat.id}`.toLowerCase()] ||
        ALL_19_SECTION_TEMPLATES[cat.id] ||
        ALL_19_SECTION_TEMPLATES[normCat] ||
        DEFAULT_STARTER_CODE;
      return {
        id: `${cleanSlug}-${cat.id}-${idx}`,
        title: cat.name,
        code: liveCode,
        variantIndex: 0,
        category: cat.id,
      };
    });
  };

  const ensureEssentialSections = (secs: SectionItem[]): SectionItem[] => {
    let clean = secs.filter((sec) => sec && sec.code);

    // 1. Ensure Header (Navbar) exists at Index 0 (Top edge) and uses clean VIT University layout
    const headerIdx = clean.findIndex((s) => {
      const cat = (s.category || s.title || "").toLowerCase();
      return cat.includes("header") || cat.includes("navbar") || normalizeCategory(cat) === "navbar";
    });

    const activeHeaderCode = liveAdminTemplatesMap["navbar"] || liveAdminTemplatesMap["header"] || ALL_19_SECTION_TEMPLATES["navbar"] || ALL_19_SECTION_TEMPLATES["header"];

    if (headerIdx < 0) {
      clean.unshift({
        id: `sec-header-${Date.now()}`,
        title: "Header Navigation",
        code: activeHeaderCode,
        category: "navbar",
        variantIndex: 0,
      });
    } else {
      if (headerIdx > 0) {
        const [h] = clean.splice(headerIdx, 1);
        clean.unshift(h!);
      }
      // Force update header code using sanitizeHeaderCode
      if (clean[0]) {
        clean[0] = {
          ...clean[0],
          title: "Header Navigation",
          code: sanitizeHeaderCode(clean[0].code),
          category: "navbar",
        };
      }
    }

    // 2. Ensure Hero Banner exists at Index 1 (Directly below Header)
    const heroIdx = clean.findIndex((s) => {
      const cat = (s.category || s.title || "").toLowerCase();
      return cat.includes("hero") || cat.includes("banner") || normalizeCategory(cat) === "hero";
    });

    if (heroIdx < 0) {
      const heroCode = liveAdminTemplatesMap["hero"] || ALL_19_SECTION_TEMPLATES["hero"];
      clean.splice(1, 0, {
        id: `sec-hero-${Date.now()}`,
        title: "Hero Banner",
        code: heroCode,
        category: "hero",
        variantIndex: 0,
      });
    } else if (heroIdx !== 1 && heroIdx > 0) {
      const [hr] = clean.splice(heroIdx, 1);
      clean.splice(1, 0, hr!);
    }

    return clean;
  };

  const deduplicateSections = (secs: SectionItem[]): SectionItem[] => {
    const seenIds = new Set<string>();
    const seenCategories = new Set<string>();

    const clean = secs.filter((sec) => {
      if (!sec || !sec.code) return false;
      if (seenIds.has(sec.id)) return false;
      seenIds.add(sec.id);

      const catKey = (sec.category || sec.title || "").toLowerCase();
      const normCat = normalizeCategory(catKey) || catKey;
      if (normCat && (normCat === "navbar" || normCat === "hero")) {
        return true;
      }
      if (normCat && seenCategories.has(normCat)) {
        return false;
      }
      if (normCat) seenCategories.add(normCat);
      return true;
    });

    return ensureEssentialSections(clean);
  };

  // Fetch sections & admin DB templates
  const fetchDbSections = async (slug: string = "/home", forceSync: boolean = false) => {
    setLoadingDb(true);
    try {
      if (!forceSync && typeof window !== "undefined") {
        try {
          const rawActive = localStorage.getItem(`xite_active_sections_${subdomain}`);
          const rawSaved = localStorage.getItem("xite_saved_pages");
          let savedSecs: SectionItem[] | null = null;

          if (rawActive && rawActive !== "undefined" && rawActive !== "null") {
            const parsedActive = JSON.parse(rawActive);
            if (Array.isArray(parsedActive) && parsedActive.length > 0) {
              savedSecs = parsedActive;
            }
          }

          if (!savedSecs && pageStore[slug] && pageStore[slug].length > 0) {
            savedSecs = pageStore[slug];
          }

          if (!savedSecs && rawSaved && rawSaved !== "undefined" && rawSaved !== "null") {
            const parsedSaved = JSON.parse(rawSaved);
            if (parsedSaved && Array.isArray(parsedSaved[slug]) && parsedSaved[slug].length > 0) {
              savedSecs = parsedSaved[slug];
            }
          }

          if (savedSecs && savedSecs.length > 0) {
            const sanitizedSecs = savedSecs.map((s, i) => {
              const catKey = (s.category || s.title || "").toLowerCase();
              if (i === 0 || catKey.includes("header") || catKey.includes("navbar") || normalizeCategory(catKey) === "navbar") {
                if (!s.code.includes("VELLORE INSTITUTE OF TECHNOLOGY")) {
                  return {
                    ...s,
                    code: ALL_19_SECTION_TEMPLATES.navbar,
                    title: "Header Navigation",
                    category: "navbar",
                  };
                }
              }
              return s;
            });
            const cleanSecs = deduplicateSections(sanitizedSecs);
            setSections(cleanSecs);
            try {
              localStorage.setItem(`xite_active_sections_${subdomain}`, JSON.stringify(cleanSecs));
              const currentSavedPages = JSON.parse(localStorage.getItem("xite_saved_pages") || "{}");
              currentSavedPages[slug] = cleanSecs;
              localStorage.setItem("xite_saved_pages", JSON.stringify(currentSavedPages));
            } catch {}
            setActiveSectionIndex(0);
            setLoadingDb(false);
            return;
          }
        } catch (err) {
          console.warn("Could not load saved sections from localStorage:", err);
        }
      }

      // If no saved sections in localStorage, load default sections for slug from API or fallback
      let fetchedSecs: SectionItem[] = [];
      for (const baseUrl of getApiBases()) {
        try {
          const defRes = await fetch(`${baseUrl}/api/v1/default-website`);
          if (defRes.ok) {
            const defData = await defRes.json().catch(() => ({}));
            if (defData && Array.isArray(defData.pages)) {
              const targetPage = defData.pages.find((p: any) => p.slug === slug) || defData.pages.find((p: any) => p.slug === "/home");
              if (targetPage && Array.isArray(targetPage.sections) && targetPage.sections.length > 0) {
                targetPage.sections.forEach((s: any, idx: number) => {
                  const code = s.code || s.html || s.content;
                  if (s && code) {
                    const rawType = s.sectionType || s.category || s.type || s.id || "";
                    const normType = normalizeCategory(rawType);
                    fetchedSecs.push({
                      id: s.id || `admin-def-sec-${idx}`,
                      title: s.title || s.name || "Section",
                      code: code,
                      category: normType || rawType,
                      variantIndex: 0,
                    });
                  }
                });
                if (fetchedSecs.length > 0) break;
              }
            }
          }
        } catch (e) {}
      }

      if (fetchedSecs.length === 0) {
        fetchedSecs = getAll19DefaultSections(slug);
      }

      const cleanSecs = deduplicateSections(fetchedSecs);
      setSections(cleanSecs);
      setActiveSectionIndex(0);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(`xite_active_sections_${subdomain}`, JSON.stringify(cleanSecs));
        }
      } catch {}
    } finally {
      setLoadingDb(false);
    }
  };

  const getApiBases = (): string[] => {
    const bases: string[] = [];

    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        bases.push("http://localhost:4000");
      }
    }

    if (process.env.NEXT_PUBLIC_API_BASE_URL) bases.push(process.env.NEXT_PUBLIC_API_BASE_URL);
    if (process.env.NEXT_PUBLIC_API_URL) bases.push(process.env.NEXT_PUBLIC_API_URL);

    // Production & Local Express Backend API Endpoints (Explicitly priority ordered)
    bases.push("https://api.xite.co.in");
    bases.push("https://api.meetkishore.in");
    bases.push("https://admin.meetkishore.in");
    bases.push("http://localhost:4000");

    return Array.from(new Set(bases.filter(Boolean).map((b) => b.replace(/\/+$/, ""))));
  };

  const loadAdminTemplates = async () => {
    let dbTemplates: any[] = [];
    const freshMap: Record<string, string> = {};
    const seenIds = new Set<string>();

    for (const baseUrl of getApiBases()) {
      try {
        const res = await fetch(`${baseUrl}/api/v1/admin/templates`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && Array.isArray(data.templates) && data.templates.length > 0) {
            data.templates.forEach((t: any) => {
              if (t && t.code) {
                const tId = t.id || `tpl-${t.name}`;
                if (!seenIds.has(tId)) {
                  seenIds.add(tId);
                  dbTemplates.push(t);
                }
              }
            });
            break;
          }
        }
      } catch (e) {}
    }

    // Map all Admin DB templates into freshMap
    if (Array.isArray(dbTemplates) && dbTemplates.length > 0) {
      dbTemplates.forEach((t: any) => {
        const code = t.code || t.html || t.content;
        if (!code) return;

        // Parse category from t.category or t.name [bracket] notation
        let rawCat = (t.category && t.category !== "undefined" && t.category !== "null") ? t.category : "";
        let parsedCat = (rawCat || t.sectionType || t.type || "").toLowerCase();
        if (parsedCat === "undefined" || parsedCat === "null") parsedCat = "";

        if (!parsedCat && t.name) {
          const match = t.name.match(/\[(.*?)\]/);
          if (match && match[1]) {
            parsedCat = match[1].toLowerCase().trim();
          }
        }
        if (!parsedCat && t.name) {
          const nameLower = t.name.toLowerCase();
          if (nameLower.includes("header") || nameLower.includes("nav")) parsedCat = "header";
          else if (nameLower.includes("hero") || nameLower.includes("banner")) parsedCat = "hero";
          else if (nameLower.includes("stat") || nameLower.includes("highlight")) parsedCat = "highlights";
          else if (nameLower.includes("about")) parsedCat = "about";
          else if (nameLower.includes("vision") || nameLower.includes("mission")) parsedCat = "vision";
          else if (nameLower.includes("course") || nameLower.includes("program")) parsedCat = "courses";
          else if (nameLower.includes("department")) parsedCat = "departments";
          else if (nameLower.includes("admission") || nameLower.includes("apply")) parsedCat = "admissions";
          else if (nameLower.includes("placement") || nameLower.includes("recruiter")) parsedCat = "placements";
          else if (nameLower.includes("facility") || nameLower.includes("hostel")) parsedCat = "facilities";
          else if (nameLower.includes("research") || nameLower.includes("innovation")) parsedCat = "research";
          else if (nameLower.includes("news") || nameLower.includes("notice")) parsedCat = "news";
          else if (nameLower.includes("event")) parsedCat = "events";
          else if (nameLower.includes("gallery") || nameLower.includes("campus")) parsedCat = "gallery";
          else if (nameLower.includes("testimonial") || nameLower.includes("alumni")) parsedCat = "testimonials";
          else if (nameLower.includes("achievement") || nameLower.includes("award")) parsedCat = "achievements";
          else if (nameLower.includes("contact") || nameLower.includes("enquiry")) parsedCat = "contact";
          else if (nameLower.includes("map") || nameLower.includes("location")) parsedCat = "map";
          else if (nameLower.includes("footer")) parsedCat = "footer";
        }

        t.category = parsedCat || t.category || "hero";
        const normCat = normalizeCategory(parsedCat);

        if (parsedCat) freshMap[parsedCat] = code;
        if (normCat) freshMap[normCat] = code;
        if (parsedCat.includes("header") || parsedCat.includes("nav") || (t.name || "").toLowerCase().includes("header") || (t.name || "").toLowerCase().includes("nav")) {
          freshMap["header"] = code;
          freshMap["navbar"] = code;
        }
      });
    }

    // Fetch live Admin DB default website sections (/api/v1/default-website) configured by Super Admin
    let defaultSecsFromAdminDb: SectionItem[] = [];
    for (const baseUrl of getApiBases()) {
      try {
        const defRes = await fetch(`${baseUrl}/api/v1/default-website`);
        if (defRes.ok) {
          const defData = await defRes.json().catch(() => ({}));
          if (defData && Array.isArray(defData.pages)) {
            const targetPage = defData.pages.find((p: any) => p.slug === currentPage.slug) || defData.pages.find((p: any) => p.slug === "/home");
            if (targetPage && Array.isArray(targetPage.sections)) {
              targetPage.sections.forEach((s: any, idx: number) => {
                const code = s.code || s.html || s.content;
                if (s && code) {
                  const rawType = s.sectionType || s.category || s.type || s.id || "";
                  const normType = normalizeCategory(rawType);
                  defaultSecsFromAdminDb.push({
                    id: s.id || `admin-def-sec-${idx}`,
                    title: s.title || s.name || "Section",
                    code: code,
                    category: normType || rawType,
                    variantIndex: 0,
                  });
                }
              });
            }

            defData.pages.forEach((p: any) => {
              if (Array.isArray(p.sections)) {
                p.sections.forEach((s: any) => {
                  const code = s.code || s.html || s.content;
                  const rawType = s.sectionType || s.category || s.type || s.id || "";
                  const normType = normalizeCategory(rawType);
                  if (rawType && !freshMap[rawType.toLowerCase()]) freshMap[rawType.toLowerCase()] = code;
                  if (normType && !freshMap[normType]) freshMap[normType] = code;
                });
              }
            });
            if (defaultSecsFromAdminDb.length > 0) break;
          }
        }
      } catch (e) {}
    }

    setAdminDbTemplates(dbTemplates);
    setLiveAdminTemplatesMap((prev) => ({ ...prev, ...freshMap }));

    // ONLY set initial sections if canvas is currently completely empty!
    setSections((prevSecs) => {
      if (prevSecs.length === 0 && defaultSecsFromAdminDb.length > 0) {
        const clean = deduplicateSections(defaultSecsFromAdminDb);
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem(`xite_active_sections_${subdomain}`, JSON.stringify(clean));
          }
        } catch {}
        return clean;
      }

      return prevSecs;
    });
  };

  useEffect(() => {
    void fetchDbSections(currentPage.slug);
    void loadAdminTemplates();
  }, [currentPage.slug]);

  const fetchAllDefaultSectionsFromAdminDb = async () => {
    setLoadingDb(true);
    let defaultSecs: SectionItem[] = [];

    for (const baseUrl of getApiBases()) {
      try {
        const defRes = await fetch(`${baseUrl}/api/v1/default-website`);
        if (defRes.ok) {
          const defData = await defRes.json().catch(() => ({}));
          if (defData && Array.isArray(defData.pages)) {
            const targetPage = defData.pages.find((p: any) => p.slug === currentPage.slug) || defData.pages.find((p: any) => p.slug === "/home");
            if (targetPage && Array.isArray(targetPage.sections)) {
              targetPage.sections.forEach((s: any, idx: number) => {
                const code = s.code || s.html || s.content;
                if (s && code) {
                  const rawType = s.sectionType || s.category || s.type || s.id || "";
                  const normType = normalizeCategory(rawType);
                  defaultSecs.push({
                    id: s.id || `admin-def-sec-${idx}`,
                    title: s.title || s.name || "Section",
                    code: code,
                    category: normType || rawType,
                    variantIndex: 0,
                  });
                }
              });
            }
            if (defaultSecs.length > 0) break;
          }
        }
      } catch (e) {}
    }

    if (defaultSecs.length > 0) {
      const cleanSecs = deduplicateSections(defaultSecs);
      setSections(cleanSecs);
      setActiveSectionIndex(0);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(`xite_active_sections_${subdomain}`, JSON.stringify(cleanSecs));
        }
      } catch {}
      showToastNotification(`Loaded ${cleanSecs.length} Default Sections from Live Admin DB!`);
    } else {
      setShowAddSectionModal(true);
    }
    setLoadingDb(false);
  };

  // ALWAYS fetch Admin DB templates on mount & poll every 4s for live Admin section updates!
  useEffect(() => {
    void loadAdminTemplates();
    const interval = setInterval(() => {
      void loadAdminTemplates();
    }, 4000);
    const handleFocus = () => {
      void loadAdminTemplates();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handlePageChange = (pageName: string, pageSlug: string) => {
    // 1. Auto-save current page sections first
    setPageStore((prev) => {
      const updated = { ...prev, [currentPage.slug]: sections };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("xite_saved_pages", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    // 2. Set new active page
    setCurrentPage({ name: pageName, slug: pageSlug });

    // 3. Load saved sections for target page if already in pageStore
    if (pageStore[pageSlug] && pageStore[pageSlug].length > 0) {
      setSections(pageStore[pageSlug]);
      setActiveSectionIndex(0);
      return;
    }

    // 4. Fetch/Load sections for target page
    void fetchDbSections(pageSlug, true);
    setActiveSectionIndex(0);
  };

  const handlePersistWebsiteSave = async () => {
    if (typeof window !== "undefined") {
      try {
        const updatedStore = { ...pageStore, [currentPage.slug]: sections };
        localStorage.setItem(`xite_active_sections_${subdomain}`, JSON.stringify(sections));
        localStorage.setItem("xite_saved_pages", JSON.stringify(updatedStore));
        setPageStore(updatedStore);
      } catch (err) {
        console.warn("Could not write to localStorage:", err);
      }
    }

    try {
      const hostname = typeof window !== "undefined" ? window.location.hostname : "";
      const apiBase = hostname === "localhost" || hostname === "127.0.0.1" ? "http://localhost:4000" : "https://api.xite.co.in";
      await fetch(`${apiBase}/api/v1/default-website`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pages: [
            {
              slug: currentPage.slug || "/home",
              title: currentPage.name || "Home",
              sections: sections.map((sec, idx) => ({
                id: sec.id || `sec-${idx}`,
                title: sec.title || `Section #${idx + 1}`,
                code: sec.code,
                sortOrder: idx,
              })),
            },
          ],
        }),
      });
    } catch (err) {
      console.warn("Could not save sections to backend API:", err);
    }
  };

  // Handle double-click inline text editing directly on section canvas
  const handleSectionDoubleClick = (e: React.MouseEvent<HTMLDivElement>, sectionIndex: number) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (!target) return;

    // Ignore container sections & structural wrappers
    if (target.tagName === "SECTION" || target.tagName === "HEADER" || target.tagName === "FOOTER" || target.tagName === "MAIN") return;
    if (target.tagName === "IMG" || target.tagName === "SVG" || (target.tagName === "BUTTON" && target.classList.contains("hamburger-toggle-btn"))) return;

    // Tags that can be edited inline
    const editableTags = ["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "A", "BUTTON", "LI", "STRONG", "EM", "B", "I", "TD", "TH", "DIV"];

    let textElem: HTMLElement | null = target;
    while (textElem && textElem !== e.currentTarget && !editableTags.includes(textElem.tagName)) {
      textElem = textElem.parentElement;
    }

    if (!textElem || textElem === e.currentTarget) {
      textElem = target;
    }

    if (textElem.tagName === "DIV" && textElem.children.length > 2) return;

    // Enable inline content editing
    textElem.contentEditable = "true";
    textElem.style.userSelect = "text";
    (textElem.style as any).webkitUserSelect = "text";
    textElem.style.outline = "2px dashed #2563eb";
    textElem.style.outlineOffset = "4px";
    textElem.style.borderRadius = "4px";
    textElem.style.backgroundColor = "rgba(37, 99, 235, 0.08)";
    
    setTimeout(() => {
      textElem?.focus();
      try {
        const range = document.createRange();
        range.selectNodeContents(textElem!);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch (err) {
        // ignore selection error
      }
    }, 20);

    // Save pre-edit history snapshot via setSectionsWithHistory when editing completes in saveUpdatedContent
    const container = e.currentTarget;

    const saveUpdatedContent = () => {
      if (!textElem) return;
      textElem.contentEditable = "false";
      textElem.style.outline = "";
      textElem.style.outlineOffset = "";
      textElem.style.borderRadius = "";
      textElem.style.backgroundColor = "";

      const canvasBox = container.querySelector(".section-canvas-box") as HTMLElement;
      const targetNode = canvasBox || container;

      const clone = targetNode.cloneNode(true) as HTMLElement;
      
      const badges = clone.querySelectorAll('.pointer-events-none');
      badges.forEach((b) => b.remove());

      const editables = clone.querySelectorAll('[contenteditable]');
      editables.forEach((el) => {
        el.removeAttribute('contenteditable');
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
        (el as HTMLElement).style.borderRadius = '';
        (el as HTMLElement).style.backgroundColor = '';
      });

      const newCode = cleanCanvasWrapperFromCode(clone.innerHTML || clone.outerHTML);
      if (newCode) {
        setSectionsWithHistory((prev) =>
          prev.map((sec, i) => (i === sectionIndex ? { ...sec, code: newCode } : sec))
        );
      }
    };

    textElem.onblur = () => {
      saveUpdatedContent();
    };

    textElem.onkeydown = (keyEvent) => {
      if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
        keyEvent.preventDefault();
        textElem!.blur();
      }
    };
  };

  // Smoothly scroll canvas viewport to top Navbar header section
  const handleJumpToNavbarLogo = () => {
    if (typeof document === "undefined") return;
    const headerSection = document.querySelector("header") || document.querySelector(".section-wrapper-container");
    if (headerSection) {
      headerSection.scrollIntoView({ behavior: "smooth", block: "center" });
      headerSection.classList.add("ring-4", "ring-amber-400");
      setTimeout(() => {
        headerSection.classList.remove("ring-4", "ring-amber-400");
      }, 2000);
      showToastNotification("🚀 Navigated to Header Navbar Logo!");
    } else {
      showToastNotification("Header Navbar section not found on canvas!");
    }
  };



  // Real-time image live update & auto-save handler
  const handleUpdateAndSaveImage = (newParams: Partial<NonNullable<typeof imagePopup>>) => {
    if (!imagePopup) return;

    const updatedPopup = { ...imagePopup, ...newParams };
    setImagePopup(updatedPopup);

    const { sectionIndex, targetElement, targetType } = updatedPopup;
    const originalUrl = (imagePopup.originalUrl || "").trim();
    const finalImageUrl = (updatedPopup.imageUrl || "").trim();
    const finalLogoText = (updatedPopup.logoText || "").trim();
    const finalBgColor = updatedPopup.bgColor;
    const finalLinkUrl = (updatedPopup.linkUrl || "").trim();
    const finalObjectFit = updatedPopup.objectFit || "cover";
    const finalBorderRadius = updatedPopup.borderRadius || "10px";

    // 1. Live DOM manipulation for immediate visual feedback on screen
    if (targetType === "logo") {
      if (finalImageUrl) {
        if (targetElement.tagName === "IMG") {
          (targetElement as HTMLImageElement).src = finalImageUrl;
          targetElement.style.objectFit = finalObjectFit;
          targetElement.style.borderRadius = finalBorderRadius;
        } else {
          targetElement.innerHTML = `<img src="${finalImageUrl}" alt="Logo" data-logo="true" style="height: 38px; width: 38px; object-fit: ${finalObjectFit}; border-radius: ${finalBorderRadius}; cursor: pointer;" />`;
        }
      } else if (finalLogoText) {
        if (targetElement.tagName === "IMG") {
          const parent = targetElement.parentElement;
          if (parent) {
            parent.innerHTML = `<span style="font-size: 16px; font-weight: 900; color: #ffffff; background: ${finalBgColor}; padding: 6px 12px; border-radius: ${finalBorderRadius}; display: inline-block;">${finalLogoText}</span>`;
          }
        } else {
          targetElement.innerText = finalLogoText;
          targetElement.style.backgroundColor = finalBgColor;
        }
      }
    } else if (targetType === "background") {
      if (finalImageUrl) {
        targetElement.style.backgroundImage = `url("${finalImageUrl}")`;
        targetElement.style.backgroundSize = "cover";
        targetElement.style.backgroundPosition = "center";
      }
    } else {
      if (targetElement.tagName === "IMG") {
        (targetElement as HTMLImageElement).src = finalImageUrl;
        targetElement.style.objectFit = finalObjectFit;
        targetElement.style.borderRadius = finalBorderRadius;
      } else {
        targetElement.style.backgroundImage = `url("${finalImageUrl}")`;
        targetElement.style.backgroundSize = "cover";
      }
    }

    // Update Logo Link destination if set
    if (finalLinkUrl) {
      let anchorParent: HTMLElement | null = targetElement;
      while (anchorParent && anchorParent.tagName !== "A" && anchorParent !== document.body) {
        anchorParent = anchorParent.parentElement;
      }
      if (anchorParent && anchorParent.tagName === "A") {
        anchorParent.setAttribute("href", finalLinkUrl);
      }
    }

    // 2. Clone section container DOM to extract exact updated section HTML code with 100% precision
    const container = targetElement.closest(".section-wrapper-container") as HTMLElement;

    setSectionsWithHistory((prevSections) => {
      return prevSections.map((sec, idx) => {
        let newCode = sec.code;

        // Bulk apply all logos across page
        if (targetType === "logo" && updatedPopup.applyAllLogos && finalImageUrl) {
          newCode = newCode.replace(/(<img[^>]*data-logo="true"[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
          newCode = newCode.replace(/(<img[^>]*alt="[^"]*Emblem[^"]*"[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
          newCode = newCode.replace(/(<img[^>]*class="[^"]*logo[^"]*"[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
          return { ...sec, code: cleanCanvasWrapperFromCode(newCode) };
        }

        // Bulk apply all section background images across page
        if (targetType === "background" && updatedPopup.applyAllBackgrounds && finalImageUrl) {
          newCode = newCode.replace(/background-image:\s*url\([^)]+\)/gi, `background-image: url("${finalImageUrl}")`);
          return { ...sec, code: cleanCanvasWrapperFromCode(newCode) };
        }

        // Update target section HTML
        if (idx === sectionIndex && container) {
          const clone = container.cloneNode(true) as HTMLElement;

          // Remove editor badges or outline artifacts
          const badges = clone.querySelectorAll(".pointer-events-none");
          badges.forEach((b) => b.remove());

          const editables = clone.querySelectorAll("[contenteditable]");
          editables.forEach((el) => {
            el.removeAttribute("contenteditable");
            (el as HTMLElement).style.outline = "";
            (el as HTMLElement).style.outlineOffset = "";
            (el as HTMLElement).style.borderRadius = "";
          });

          // Match exact target element by tag and index position
          if (targetElement.tagName === "IMG") {
            const containerImgs = Array.from(container.querySelectorAll("img"));
            const targetImgIndex = containerImgs.indexOf(targetElement as HTMLImageElement);
            const cloneImgs = clone.querySelectorAll("img");

            if (targetImgIndex >= 0 && cloneImgs[targetImgIndex]) {
              const targetCloneImg = cloneImgs[targetImgIndex]!;
              if (finalImageUrl) targetCloneImg.src = finalImageUrl;
              targetCloneImg.style.objectFit = finalObjectFit;
              targetCloneImg.style.borderRadius = finalBorderRadius;
            } else if (originalUrl && clone.innerHTML.includes(originalUrl)) {
              clone.innerHTML = clone.innerHTML.replaceAll(originalUrl, finalImageUrl);
            }
          } else if (targetType === "background" && finalImageUrl) {
            const bgElem = clone.querySelector('[style*="background-image"]') || clone.firstElementChild || clone;
            (bgElem as HTMLElement).style.backgroundImage = `url("${finalImageUrl}")`;
            (bgElem as HTMLElement).style.backgroundSize = "cover";
            (bgElem as HTMLElement).style.backgroundPosition = "center";
          } else if (targetType === "logo") {
            if (finalImageUrl) {
              const logoElem = clone.querySelector('img[data-logo="true"]') || clone.querySelector('img.logo') || clone.querySelector('img');
              if (logoElem) {
                (logoElem as HTMLImageElement).src = finalImageUrl;
                (logoElem as HTMLElement).style.objectFit = finalObjectFit;
                (logoElem as HTMLElement).style.borderRadius = finalBorderRadius;
              }
            }
          }

          // Update logo link URL on container clone if set
          if (finalLinkUrl) {
            const logoLink = clone.querySelector('a[href]') || clone.querySelector('a');
            if (logoLink) logoLink.setAttribute("href", finalLinkUrl);
          }

          const extractedCode = cleanCanvasWrapperFromCode(clone.innerHTML);
          if (extractedCode) return { ...sec, code: extractedCode };
        }

        // Direct string replacement fallback if container element not found
        if (idx === sectionIndex && originalUrl && finalImageUrl && newCode.includes(originalUrl)) {
          newCode = newCode.replaceAll(originalUrl, finalImageUrl);
          return { ...sec, code: cleanCanvasWrapperFromCode(newCode) };
        }

        return sec;
      });
    });

    showToastNotification("⚡ Image & Logo updated & auto-saved!");
  };

  // Auto-Update & Save Map Location, iFrame Embed, and Directions Link
  const handleUpdateAndSaveMap = (newParams: Partial<NonNullable<typeof mapPopup>>) => {
    if (!mapPopup) return;
    const updatedPopup = { ...mapPopup, ...newParams };
    setMapPopup(updatedPopup);

    const { sectionIndex, mapEmbedUrl, directionsUrl, locationName } = updatedPopup;
    const sec = sections[sectionIndex];
    if (!sec) return;

    let code = sec.code;

    // 1. Replace or insert iframe embed src
    if (code.includes("<iframe")) {
      code = code.replace(/<iframe[^>]*src=["']([^"']*)["'][^>]*>/gi, (match) => {
        return match.replace(/src=["']([^"']*)["']/i, `src="${mapEmbedUrl}"`);
      });
    } else {
      code = code.replace(
        /<div[^>]*>.*?Interactive Google Map View.*?<\/div>/gi,
        `<iframe src="${mapEmbedUrl}" width="100%" height="340" style="border:0; border-radius: 20px; margin-top: 24px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
      );
    }

    // 2. Update directions link href
    if (directionsUrl && (code.includes("GET DIRECTIONS") || code.includes("maps.google"))) {
      code = code.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?GET DIRECTIONS[\s\S]*?)<\/a>/gi, (match) => {
        return match.replace(/href=["']([^"']*)["']/i, `href="${directionsUrl}"`);
      });
    }

    // 3. Update location name title text if present
    if (locationName && (code.includes("CAMPUS") || code.includes("UNIVERSITY") || code.includes("LOCATION"))) {
      code = code.replace(/(VELLORE INSTITUTE OF TECHNOLOGY|UNIVERSAL COLLEGE CAMPUS|GREENFIELD CAMPUS|MAIN CAMPUS LOCATION)/gi, locationName);
    }

    setSectionsWithHistory((prev) =>
      prev.map((s, idx) => (idx === sectionIndex ? { ...s, code } : s))
    );
    void handlePersistWebsiteSave();
    showToastNotification("⚡ Campus map location & directions updated!");
  };

  // Right-click handler for Images, Logos, Section Backgrounds, Maps, and Buttons
  const handleSectionContextMenu = (e: React.MouseEvent<HTMLDivElement>, sectionIndex: number) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // 📍 1. Map & Location iFrame / Button Target Detection
    const secObj = sections[sectionIndex];
    const secCategory = (secObj?.category || secObj?.title || "").toLowerCase();
    const isMapTarget =
      target.tagName === "IFRAME" ||
      target.closest("iframe") !== null ||
      (target.textContent && (target.textContent.includes("GOOGLE MAPS") || target.textContent.includes("CAMPUS LOCATION") || target.textContent.includes("GET DIRECTIONS"))) ||
      secCategory.includes("map") ||
      secCategory.includes("location");

    if (isMapTarget) {
      e.preventDefault();
      e.stopPropagation();

      const secContainer = document.querySelectorAll(".section-wrapper-container")[sectionIndex] as HTMLElement;
      const iframeElem = secContainer ? (secContainer.querySelector("iframe") as HTMLIFrameElement | null) : null;
      const currentEmbedUrl = iframeElem?.src || "https://maps.google.com/maps?q=Vellore%20Institute%20of%20Technology&t=&z=14&ie=UTF8&iwloc=&output=embed";

      const directionsBtn = secContainer ? (secContainer.querySelector("a[href*='maps']") as HTMLAnchorElement | null) : null;
      const currentDirectionsUrl = directionsBtn?.getAttribute("href") || "https://maps.google.com/?q=Vellore+Institute+of+Technology";

      setMapPopup({
        sectionIndex,
        mapEmbedUrl: currentEmbedUrl,
        directionsUrl: currentDirectionsUrl,
        locationName: "VELLORE INSTITUTE OF TECHNOLOGY",
      });
      return;
    }

    let currElem: HTMLElement | null = target;
    let targetType: "logo" | "image" | "background" | null = null;
    let imageUrl = "";
    let logoText = "";
    let bgColor = "#2563eb";
    let linkUrl = "";
    let objectFit: "cover" | "contain" | "fill" = "cover";
    let borderRadius = "10px";

    while (currElem && currElem !== e.currentTarget) {
      const tagName = currElem.tagName;
      const cls = (currElem.className || "").toString().toLowerCase();
      const isDataLogo = currElem.getAttribute("data-logo") === "true";
      const compStyle = window.getComputedStyle(currElem);
      const bgImg = compStyle.backgroundImage || currElem.style.backgroundImage || "";

      if (currElem.tagName === "A" || currElem.getAttribute("href")) {
        linkUrl = currElem.getAttribute("href") || "";
      }

      if (tagName === "IMG") {
        imageUrl = (currElem as HTMLImageElement).src || currElem.getAttribute("src") || "";
        if (isDataLogo || cls.includes("logo") || currElem.parentElement?.className?.toLowerCase().includes("logo")) {
          targetType = "logo";
        } else {
          targetType = "image";
        }
        objectFit = (compStyle.objectFit as any) || "cover";
        borderRadius = compStyle.borderRadius || "10px";
        break;
      } else if (isDataLogo || cls.includes("logo") || (currElem.innerText && currElem.innerText.trim().length <= 4 && (currElem.innerText.includes("AU") || currElem.innerText.includes("🎓") || currElem.innerText.includes("MEC")))) {
        targetType = "logo";
        logoText = currElem.innerText?.trim() || "LOGO";
        const imgChild = currElem.querySelector("img");
        if (imgChild) {
          imageUrl = imgChild.src;
        }
        bgColor = compStyle.backgroundColor !== "rgba(0, 0, 0, 0)" ? compStyle.backgroundColor : "#2563eb";
        break;
      } else if (bgImg && bgImg !== "none" && bgImg.includes("url(")) {
        targetType = "background";
        const match = bgImg.match(/url\(["']?(.*?)["']?\)/);
        if (match && match[1]) imageUrl = match[1];
        break;
      }
      currElem = currElem.parentElement;
    }

    // Fallback: check section background if right clicked empty space
    if (!targetType) {
      const secWrapper = target.closest(".section-wrapper-container") as HTMLElement;
      if (secWrapper) {
        const compStyle = window.getComputedStyle(secWrapper);
        const bgImg = compStyle.backgroundImage || secWrapper.style.backgroundImage || "";
        if (bgImg && bgImg !== "none" && bgImg.includes("url(")) {
          targetType = "background";
          const match = bgImg.match(/url\(["']?(.*?)["']?\)/);
          if (match && match[1]) imageUrl = match[1];
          currElem = secWrapper;
        }
      }
    }

    // Open Image & Logo Customizer Modal if Image/Logo/Background detected
    if (targetType && currElem) {
      e.preventDefault();
      e.stopPropagation();

      const mouseX = Math.min(e.clientX, window.innerWidth - 480);
      const mouseY = Math.min(e.clientY, window.innerHeight - 480);

      setImagePopup({
        x: Math.max(10, mouseX),
        y: Math.max(10, mouseY),
        sectionIndex,
        targetElement: currElem,
        targetType,
        logoText: logoText || "AU",
        bgColor,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80",
        originalUrl: imageUrl,
        linkUrl: linkUrl || "/home",
        applyAllLogos: targetType === "logo",
        applyAllBackgrounds: targetType === "background",
        activeTab: targetType === "logo" ? "logo" : targetType === "background" ? "background" : "image",
        objectFit,
        borderRadius,
      });
      return;
    }

    // Find nearest clickable link or button
    let linkElem: HTMLElement | null = target;
    while (
      linkElem &&
      linkElem !== e.currentTarget &&
      linkElem.tagName !== "A" &&
      linkElem.tagName !== "BUTTON" &&
      !linkElem.getAttribute("href") &&
      !linkElem.getAttribute("data-href")
    ) {
      linkElem = linkElem.parentElement;
    }

    if (!linkElem || linkElem === e.currentTarget) {
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.getAttribute("href")) {
        linkElem = target;
      } else {
        return;
      }
    }

    // Intercept right-click context menu on buttons/links
    e.preventDefault();
    e.stopPropagation();

    const currentHref = linkElem.getAttribute("href") || linkElem.getAttribute("data-href") || "#";
    const targetAttr = linkElem.getAttribute("target");
    const isNewTab = targetAttr === "_blank";

    const mouseX = Math.min(e.clientX, window.innerWidth - 340);
    const mouseY = Math.min(e.clientY, window.innerHeight - 300);

    setLinkPopup({
      x: Math.max(10, mouseX),
      y: Math.max(10, mouseY),
      sectionIndex,
      targetElement: linkElem,
      currentUrl: currentHref,
      isNewTab: isNewTab,
    });
  };

  const handleSaveLogo = (newText: string, newBgColor: string, newImageUrl: string) => {
    handleUpdateAndSaveImage({ logoText: newText, bgColor: newBgColor, imageUrl: newImageUrl });
    setImagePopup(null);
  };

  // Save updated URL & target attributes on button element
  const handleSaveButtonUrl = (newUrl: string, openNewTab: boolean) => {
    if (!linkPopup) return;

    const { sectionIndex, targetElement } = linkPopup;

    if (targetElement.tagName === "A" || targetElement.getAttribute("href") !== null) {
      targetElement.setAttribute("href", newUrl);
    } else {
      targetElement.setAttribute("data-href", newUrl);
      targetElement.setAttribute("onclick", `window.location.href='${newUrl}'`);
    }

    if (openNewTab) {
      targetElement.setAttribute("target", "_blank");
      targetElement.setAttribute("rel", "noopener noreferrer");
    } else {
      targetElement.removeAttribute("target");
      targetElement.removeAttribute("rel");
    }

    // Extract section wrapper element to save updated HTML
    const container = targetElement.closest('.section-wrapper-container') || targetElement.closest('.relative');
    if (container) {
      const clone = container.cloneNode(true) as HTMLElement;
      const badges = clone.querySelectorAll('.pointer-events-none');
      badges.forEach((b) => b.remove());

      const editables = clone.querySelectorAll('[contenteditable]');
      editables.forEach((el) => {
        el.removeAttribute('contenteditable');
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
        (el as HTMLElement).style.borderRadius = '';
      });

      const newCode = cleanCanvasWrapperFromCode(clone.innerHTML);
      if (newCode) {
        setSectionsWithHistory((prev) =>
          prev.map((sec, i) => (i === sectionIndex ? { ...sec, code: newCode } : sec))
        );
      }
    }

    setLinkPopup(null);
  };

  // Add a section from predefined categories
  const handleAddSectionFromCategory = async (cat: { id: string; name: string }) => {
    let templatesList: any[] = [];
    const seenIds = new Set<string>();

    for (const baseUrl of getApiBases()) {
      try {
        const res = await fetch(`${baseUrl}/api/v1/admin/templates`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && Array.isArray(data.templates) && data.templates.length > 0) {
            data.templates.forEach((t: any) => {
              if (t && t.code) {
                const tId = t.id || `tpl-${t.name}`;
                if (!seenIds.has(tId)) {
                  seenIds.add(tId);
                  templatesList.push(t);
                }
              }
            });
            break;
          }
        }
      } catch (e) {}
    }
    if (templatesList.length === 0) {
      templatesList = adminDbTemplates;
    }

    // Filter admin-added templates matching selected category tag ONLY
    const catIdLower = cat.id.toLowerCase();
    const catNameLower = cat.name.toLowerCase();
    const normCat = normalizeCategory(cat.id);

    const matchingTemplates = templatesList.filter((tpl) => {
      const nameLower = (tpl.name || tpl.title || "").toLowerCase();
      const rawCat = (tpl.category && tpl.category !== "undefined" && tpl.category !== "null") ? tpl.category : "";
      const tplCatLower = (rawCat || tpl.type || tpl.catId || tpl.sectionType || "").toLowerCase();
      const normTplCat = normalizeCategory(tplCatLower) || normalizeCategory(nameLower);

      if (normTplCat && (normTplCat === normCat || normTplCat === catIdLower)) return true;
      if (tplCatLower === catIdLower) return true;
      if (nameLower.includes(`[${catIdLower}]`) || nameLower.includes(catIdLower) || nameLower.includes(catNameLower) || (normCat && nameLower.includes(normCat))) return true;
      return false;
    });

    let newCode = "";
    let newTitle = cat.name;

    if (matchingTemplates.length > 0) {
      newCode = matchingTemplates[0]!.code;
      newTitle = matchingTemplates[0]!.name || cat.name;
    } else {
      newCode = liveAdminTemplatesMap[cat.id] || liveAdminTemplatesMap[normCat] || ALL_19_SECTION_TEMPLATES[cat.id] || DEFAULT_STARTER_CODE;
    }

    // 1. Header MUST ALWAYS be placed at index 0 (the very top of the page)
    if (cat.id === "navbar" || cat.id === "header" || normCat === "navbar") {
      const newHeaderSection: SectionItem = {
        id: `sec-header-${Date.now()}`,
        title: newTitle || "Header Navigation",
        code: newCode,
        category: "navbar",
        variantIndex: 0,
      };

      setSectionsWithHistory((prev) => {
        const filtered = prev.filter((s) => {
          const sCat = (s.category || s.title || "").toLowerCase();
          return !sCat.includes("header") && !sCat.includes("navbar") && normalizeCategory(sCat) !== "navbar";
        });
        return [newHeaderSection, ...filtered];
      });
      setActiveSectionIndex(0);
      showToastNotification(`Set Header Navigation at top of page`);
      setShowAddSectionModal(false);
      void handlePersistWebsiteSave();
      return;
    }

    // 2. Hero MUST ALWAYS be placed at index 1 (directly below Header)
    if (cat.id === "hero" || normCat === "hero") {
      const newHeroSection: SectionItem = {
        id: `sec-hero-${Date.now()}`,
        title: newTitle || "Hero Banner",
        code: newCode,
        category: "hero",
        variantIndex: 0,
      };

      setSectionsWithHistory((prev) => {
        const filtered = prev.filter((s) => {
          const sCat = (s.category || s.title || "").toLowerCase();
          return !sCat.includes("hero") && !sCat.includes("banner") && normalizeCategory(sCat) !== "hero";
        });
        const headerSec = filtered.find((s) => {
          const sCat = (s.category || s.title || "").toLowerCase();
          return sCat.includes("header") || sCat.includes("navbar") || normalizeCategory(sCat) === "navbar";
        });
        const rest = filtered.filter((s) => s !== headerSec);
        return headerSec ? [headerSec, newHeroSection, ...rest] : [newHeroSection, ...rest];
      });
      setActiveSectionIndex(1);
      showToastNotification(`Set Hero Banner directly under Header`);
      setShowAddSectionModal(false);
      void handlePersistWebsiteSave();
      return;
    }

    // 3. For any other section: Replace in-place if exists, otherwise insert before Footer or append in sequence
    const existingIndex = sections.findIndex((s) => {
      const sCat = (s.category || s.title || "").toLowerCase();
      const normSCat = normalizeCategory(sCat) || sCat;
      return sCat === cat.id.toLowerCase() || normSCat === normCat;
    });

    if (existingIndex >= 0) {
      setSectionsWithHistory((prev) =>
        prev.map((sec, idx) => {
          if (idx !== existingIndex) return sec;
          return {
            ...sec,
            title: newTitle,
            code: newCode,
            category: cat.id,
            variantIndex: 0,
          };
        })
      );
      setActiveSectionIndex(existingIndex);
      showToastNotification(`Updated ${newTitle} layout`);
    } else {
      const newSection: SectionItem = {
        id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: newTitle,
        code: newCode,
        category: cat.id,
        variantIndex: 0,
      };

      setSectionsWithHistory((prev) => {
        // Insert before footer if footer exists at the bottom
        const footerIdx = prev.findIndex((s) => {
          const sCat = (s.category || s.title || "").toLowerCase();
          return sCat.includes("footer") || normalizeCategory(sCat) === "footer";
        });
        if (footerIdx >= 0) {
          const copy = [...prev];
          copy.splice(footerIdx, 0, newSection);
          return copy;
        }
        return [...prev, newSection];
      });
      setActiveSectionIndex(sections.length);
      showToastNotification(`Added ${newTitle} to page`);
    }
    setShowAddSectionModal(false);
    void handlePersistWebsiteSave();
  };

  // Swap / Cycle between section variants for the ACTIVE category ONLY
  const handleSwapVariant = async () => {
    if (sections.length === 0) return;
    const targetIndex = activeSectionIndex !== null ? activeSectionIndex : 0;
    const activeSec = sections[targetIndex];
    if (!activeSec) return;
    if (activeSectionIndex === null) {
      setActiveSectionIndex(0);
    }

    let templatesList: any[] = [];
    const seenIds = new Set<string>();

    for (const baseUrl of getApiBases()) {
      try {
        const res = await fetch(`${baseUrl}/api/v1/admin/templates`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && Array.isArray(data.templates) && data.templates.length > 0) {
            data.templates.forEach((t: any) => {
              if (t && t.code) {
                const tId = t.id || `tpl-${t.name}`;
                if (!seenIds.has(tId)) {
                  seenIds.add(tId);
                  templatesList.push(t);
                }
              }
            });
            break;
          }
        }
      } catch (e) {}
    }
    if (templatesList.length === 0) {
      templatesList = adminDbTemplates;
    }

    // 1. Accurately determine Category ID of the ACTIVE section
    const titleLower = (activeSec.title || "").toLowerCase();
    const codeLower = (activeSec.code || "").toLowerCase();
    const idLower = (activeSec.id || "").toLowerCase();
    const secCategoryLower = (activeSec.category || "").toLowerCase();

    let catId = secCategoryLower;

    if (!catId) {
      if (titleLower.includes("nav") || titleLower.includes("header") || idLower.includes("nav") || idLower.includes("header") || (codeLower.includes("<header") && !codeLower.includes("admissions"))) {
        catId = "navbar";
      } else if (titleLower.includes("hero") || titleLower.includes("banner") || idLower.includes("hero") || idLower.includes("banner")) {
        catId = "hero";
      } else if (titleLower.includes("highlight") || titleLower.includes("stat") || titleLower.includes("metric") || idLower.includes("highlight") || idLower.includes("stat")) {
        catId = "highlights";
      } else if (titleLower.includes("about") || idLower.includes("about")) {
        catId = "about";
      } else if (titleLower.includes("vision") || titleLower.includes("mission") || idLower.includes("vision")) {
        catId = "vision";
      } else if (titleLower.includes("course") || titleLower.includes("program") || titleLower.includes("academic") || idLower.includes("course") || idLower.includes("program")) {
        catId = "courses";
      } else if (titleLower.includes("department") || idLower.includes("department")) {
        catId = "departments";
      } else if (titleLower.includes("admission") || idLower.includes("admission")) {
        catId = "admissions";
      } else if (titleLower.includes("placement") || titleLower.includes("recruiter") || titleLower.includes("career") || idLower.includes("placement")) {
        catId = "placements";
      } else if (titleLower.includes("facilit") || titleLower.includes("infrastruct") || idLower.includes("facilit")) {
        catId = "facilities";
      } else if (titleLower.includes("research") || titleLower.includes("patent") || titleLower.includes("r&d") || idLower.includes("research")) {
        catId = "research";
      } else if (titleLower.includes("news") || titleLower.includes("circular") || titleLower.includes("announcement") || idLower.includes("news")) {
        catId = "news";
      } else if (titleLower.includes("event") || titleLower.includes("calendar") || titleLower.includes("event")) {
        catId = "events";
      } else if (titleLower.includes("gallery") || titleLower.includes("campus life") || idLower.includes("gallery")) {
        catId = "gallery";
      } else if (titleLower.includes("testimonial") || titleLower.includes("alumni") || titleLower.includes("say") || idLower.includes("testimonial")) {
        catId = "testimonials";
      } else if (titleLower.includes("achievement") || titleLower.includes("award") || titleLower.includes("recognition") || idLower.includes("achievement") || idLower.includes("award")) {
        catId = "achievements";
      } else if (titleLower.includes("contact") || titleLower.includes("enquiry") || titleLower.includes("inquiry") || idLower.includes("contact")) {
        catId = "contact";
      } else if (titleLower.includes("map") || titleLower.includes("location") || idLower.includes("map")) {
        catId = "map";
      } else if (titleLower.includes("footer") || idLower.includes("footer") || codeLower.includes("<footer")) {
        catId = "footer";
      } else {
        const idParts = idLower.split("-");
        catId = idParts.length >= 2 ? idParts[1]! : "custom";
      }
    }

    const normCatId = normalizeCategory(catId);

    // Clean up repeating suffixes from current title
    const cleanBaseTitle = (activeSec.title || "")
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/(\s*Layout\s*\d+)+$/gi, "")
      .replace(/(\s*Variant\s*\d+)+$/gi, "")
      .replace(/(\s*Default)+$/gi, "")
      .trim() || catId.toUpperCase();

    // 2. STRICT Category Filtering: Collect ONLY templates that belong to THIS SPECIFIC category
    const matchingTemplates: { name: string; code: string }[] = [];

    // Filter Admin DB templates strictly by category
    const adminDbMatches: { name: string; code: string }[] = [];
    templatesList.forEach((tpl) => {
      const nameLower = (tpl.name || tpl.title || "").toLowerCase();
      const rawCat = (tpl.category && tpl.category !== "undefined" && tpl.category !== "null") ? tpl.category : "";
      const tplCatLower = (rawCat || tpl.type || tpl.catId || tpl.sectionType || "").toLowerCase();
      const codeStr = (tpl.code || tpl.html || tpl.content || tpl.templateCode || "").trim();
      const normTplCat = normalizeCategory(tplCatLower) || normalizeCategory(nameLower);

      if (!codeStr) return;

      let isMatch = false;

      if (normTplCat && normTplCat === normCatId) {
        isMatch = true;
      } else if (catId === "vision") {
        isMatch = tplCatLower === "vision" || tplCatLower.includes("vision") || nameLower.includes("vision") || nameLower.includes("mission");
      } else if (catId === "events" || catId === "event") {
        isMatch = tplCatLower === "events" || tplCatLower === "event" || tplCatLower.includes("event") || nameLower.includes("event");
      } else if (catId === "admissions" || catId === "admission") {
        isMatch = tplCatLower === "admissions" || tplCatLower === "admission" || nameLower.includes("admission");
      } else if (catId === "hero") {
        isMatch = (normTplCat === "hero" || tplCatLower.includes("hero") || nameLower.includes("hero") || nameLower.includes("banner")) && !nameLower.includes("header") && !nameLower.includes("nav");
      } else if (catId === "navbar" || catId === "header") {
        isMatch = normTplCat === "navbar" || tplCatLower.includes("header") || tplCatLower.includes("nav") || nameLower.includes("header") || nameLower.includes("nav");
      } else {
        isMatch = tplCatLower === catId || nameLower.includes(catId);
      }

      if (isMatch) {
        const trimmedCode = codeStr.trim();
        if (!adminDbMatches.some((m) => m.code.trim() === trimmedCode)) {
          adminDbMatches.push({
            name: (tpl.name || tpl.title || cleanBaseTitle).replace(/\s*\([^)]*\)/g, "").trim(),
            code: trimmedCode,
          });
        }
      }
    });

    const seenCodes = new Set<string>();

    if (adminDbMatches.length > 0) {
      adminDbMatches.forEach((m) => {
        const trimmed = m.code.trim();
        if (!seenCodes.has(trimmed)) {
          seenCodes.add(trimmed);
          matchingTemplates.push(m);
        }
      });
    } else {
      const categoryDefaultCode = liveAdminTemplatesMap[catId] || liveAdminTemplatesMap[normCatId] || ALL_19_SECTION_TEMPLATES[catId] || ALL_19_SECTION_TEMPLATES[normCatId];
      if (categoryDefaultCode) {
        const trimmed = categoryDefaultCode.trim();
        if (!seenCodes.has(trimmed)) {
          seenCodes.add(trimmed);
          matchingTemplates.push({
            name: `${cleanBaseTitle} - Layout 1`,
            code: trimmed,
          });
        }
      }

      if (matchingTemplates.length === 1) {
        const primaryCode = matchingTemplates[0]!.code;
        let altCode = primaryCode;
        if (altCode.includes("background: #ffffff") || altCode.includes("background:#ffffff") || altCode.includes("background: #f8fafc")) {
          altCode = altCode.replace(/background:\s*#(ffffff|f8fafc|f1f5f9)/gi, "background: #0f172a")
                           .replace(/color:\s*#(0f172a|1e293b|475569)/gi, "color: #ffffff");
        } else {
          altCode = altCode.replace(/background:\s*#(0f172a|090d16|0b1329|090e1a)/gi, "background: #ffffff")
                           .replace(/color:\s*#(ffffff|f8fafc|cbd5e1|94a3b8)/gi, "color: #0f172a");
        }
        matchingTemplates.push({
          name: `${cleanBaseTitle} - Layout 2`,
          code: altCode,
        });
      }
    }

    const currentVariantIdx = typeof activeSec.variantIndex === "number" ? activeSec.variantIndex : 0;
    let nextIdx = 0;

    const matchedCodeIdx = matchingTemplates.findIndex(
      (t) =>
        t.code.trim() === activeSec.code.trim() ||
        cleanCanvasWrapperFromCode(t.code) === cleanCanvasWrapperFromCode(activeSec.code)
    );

    if (matchedCodeIdx >= 0) {
      nextIdx = (matchedCodeIdx + 1) % matchingTemplates.length;
    } else {
      nextIdx = (currentVariantIdx + 1) % matchingTemplates.length;
    }

    const nextTpl = matchingTemplates[nextIdx]!;

    setSectionsWithHistory((prev) =>
      prev.map((sec, idx) => {
        if (idx !== targetIndex) return sec;
        return {
          ...sec,
          title: nextTpl.name || cleanBaseTitle,
          code: nextTpl.code,
          category: catId,
          variantIndex: nextIdx,
        };
      })
    );

    showToastNotification(`Section variant updated! (Layout ${nextIdx + 1} of ${matchingTemplates.length})`);
    void handlePersistWebsiteSave();
  };

  const handleDuplicateSection = () => {
    if (activeSectionIndex === null || sections.length === 0) return;
    const current = sections[activeSectionIndex];
    if (!current) return;
    const duplicated: SectionItem = {
      id: `sec-${Date.now()}`,
      title: `${current.title} (Copy)`,
      code: current.code,
      variantIndex: current.variantIndex,
    };
    setSectionsWithHistory((prev) => [
      ...prev.slice(0, activeSectionIndex + 1),
      duplicated,
      ...prev.slice(activeSectionIndex + 1),
    ]);
    setActiveSectionIndex(activeSectionIndex + 1);
  };

  const handleDeleteSection = () => {
    if (activeSectionIndex === null || sections.length === 0) return;
    setSectionsWithHistory((prev) => prev.filter((_, idx) => idx !== activeSectionIndex));
    setActiveSectionIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
  };

  const handleMoveUp = () => {
    if (activeSectionIndex === null || activeSectionIndex <= 0) return;
    setSectionsWithHistory((prev) => {
      const copy = [...prev];
      const temp = copy[activeSectionIndex];
      copy[activeSectionIndex] = copy[activeSectionIndex - 1];
      copy[activeSectionIndex - 1] = temp;
      return copy;
    });
    setActiveSectionIndex((prev) => (prev !== null ? prev - 1 : null));
  };

  const handleMoveDown = () => {
    if (activeSectionIndex === null || activeSectionIndex >= sections.length - 1) return;
    setSectionsWithHistory((prev) => {
      const copy = [...prev];
      const temp = copy[activeSectionIndex];
      copy[activeSectionIndex] = copy[activeSectionIndex + 1];
      copy[activeSectionIndex + 1] = temp;
      return copy;
    });
    setActiveSectionIndex((prev) => (prev !== null ? prev + 1 : null));
  };

  const handleEnableTextEditingForActiveSection = () => {
    const targetIndex = activeSectionIndex !== null ? activeSectionIndex : 0;
    if (sections.length === 0) return;

    setActiveSectionIndex(targetIndex);

    const sectionContainers = document.querySelectorAll(".section-wrapper-container");
    const container = sectionContainers[targetIndex] as HTMLElement;
    if (!container) return;

    const textElems = container.querySelectorAll("h1, h2, h3, h4, h5, h6, p, span, a, button:not(.hamburger-toggle-btn), li, strong, em, b, i, td, th");

    textElems.forEach((textElem) => {
      const elem = textElem as HTMLElement;
      if (elem.children.length > 2 && elem.tagName === "DIV") return;

      elem.contentEditable = "true";
      elem.style.userSelect = "text";
      (elem.style as any).webkitUserSelect = "text";
      elem.style.outline = "2px dashed #2563eb";
      elem.style.outlineOffset = "4px";
      elem.style.borderRadius = "4px";

      const saveUpdatedContent = () => {
        elem.contentEditable = "false";
        elem.style.outline = "";
        elem.style.outlineOffset = "";
        elem.style.borderRadius = "";

        const canvasBox = container.querySelector(".section-canvas-box") as HTMLElement;
        const targetNode = canvasBox || container;

        const clone = targetNode.cloneNode(true) as HTMLElement;

        const badges = clone.querySelectorAll('.pointer-events-none');
        badges.forEach((b) => b.remove());

        const editables = clone.querySelectorAll('[contenteditable]');
        editables.forEach((el) => {
          el.removeAttribute('contenteditable');
          (el as HTMLElement).style.outline = '';
          (el as HTMLElement).style.outlineOffset = '';
          (el as HTMLElement).style.borderRadius = '';
          (el as HTMLElement).style.backgroundColor = '';
        });

        const newCode = cleanCanvasWrapperFromCode(clone.innerHTML || clone.outerHTML);
        if (newCode) {
          setSectionsWithHistory((prev) =>
            prev.map((sec, i) => (i === targetIndex ? { ...sec, code: newCode } : sec))
          );
        }
      };

      elem.onblur = () => {
        saveUpdatedContent();
      };

      elem.onkeydown = (keyEvent) => {
        if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
          keyEvent.preventDefault();
          elem.blur();
        }
      };
    });

    if (textElems.length > 0) {
      const firstElem = textElems[0] as HTMLElement;
      try {
        firstElem.focus();
      } catch (e) {
        // ignore focus error
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative">
      


      {/* Main Studio Canvas Workspace */}
      <main
        onClick={() => setActiveSectionIndex(null)}
        className={`flex-1 w-full flex flex-col items-center justify-start pb-64 cursor-pointer min-h-screen transition-all ${
          viewportWidth === "100%" ? "bg-white p-0 m-0" : "bg-slate-100/90 px-4 sm:px-8 pt-0 pb-12 mt-0"
        }`}
      >
        <div
          className={`transition-all duration-300 flex flex-col items-center justify-start mx-auto bg-white overflow-hidden max-w-full ${
            viewportWidth === "100%"
              ? "w-full min-h-screen rounded-none border-none shadow-none m-0 p-0"
              : "min-h-[75vh] shadow-2xl rounded-2xl border border-slate-300 mt-0 mb-4"
          }`}
          style={{ width: viewportWidth, maxWidth: "100%" }}
        >
          {sections.length === 0 ? (
            /* Empty Canvas State */
            <div className="my-16 text-center space-y-4 max-w-md p-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-700">
                <Layout className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Empty Page Canvas</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                No sections have been added for page {currentPage.name}. Click below to add sections to this page.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <AddSectionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchAllDefaultSectionsFromAdminDb();
                  }}
                  label="Add Section"
                  size="md"
                />
              </div>
            </div>
          ) : (
            /* Pure Section Rendering for Current Page */
            <div className="w-full overflow-hidden">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    const target = e.target as HTMLElement;

                    // If user is actively editing text in contenteditable, DO NOT trigger section re-render
                    if (target && (target.isContentEditable || target.getAttribute("contenteditable") === "true" || target.closest("[contenteditable='true']"))) {
                      setActiveSectionIndex(idx);
                      return;
                    }

                    // Always select the exact section canvas item clicked on
                    setActiveSectionIndex(idx);

                    // Check if link was clicked
                    const anchorElem = target ? (target.closest("a") as HTMLAnchorElement | null) : null;
                    if (anchorElem) {
                      e.preventDefault();
                      e.stopPropagation();

                      const href = (anchorElem.getAttribute("href") || "").toLowerCase().trim();
                      const text = (anchorElem.textContent || "").toLowerCase().trim();

                      // Close mobile drawer menu if link was clicked inside drawer
                      const parentDrawer = anchorElem.closest(".mobile-drawer-menu") as HTMLElement | null;
                      if (parentDrawer) {
                        parentDrawer.classList.remove("active");
                        parentDrawer.style.setProperty("display", "none", "important");

                        if (href.startsWith("/")) {
                          const pageSlug = href;
                          const pageName = text || href.replace("/", "");
                          handlePageChange(pageName, pageSlug);
                        } else {
                          const targetCategory = href.replace(/^#\/?/, "").replace(/^\//, "") || normalizeCategory(text);
                          const matchedIdx = sections.findIndex((sec, sIdx) => {
                            if (sIdx === 0 && (sec.category === "navbar" || sec.category === "header")) return false;
                            const sCat = (sec.category || sec.title || "").toLowerCase();
                            const normSCat = normalizeCategory(sCat);
                            return targetCategory && (sCat.includes(targetCategory) || normSCat === normalizeCategory(targetCategory));
                          });
                          if (matchedIdx >= 0) {
                            setActiveSectionIndex(matchedIdx);
                            const secContainers = document.querySelectorAll(".section-wrapper-container");
                            const targetSecElem = secContainers[matchedIdx] as HTMLElement;
                            if (targetSecElem) {
                              targetSecElem.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }
                        }
                      }
                    }

                    if (target) {
                      const hamburgerBtn = target.closest("button.hamburger-toggle-btn, button.hamburger, [data-mobile-menu], .mobile-menu-btn, .hamburger, header button, header svg") as HTMLElement;
                      if (hamburgerBtn) {
                        e.preventDefault();
                        e.stopPropagation();

                        const headerElem = hamburgerBtn.closest("header") || hamburgerBtn.closest(".section-wrapper-container") || target.closest("header") || document.querySelector("header");
                        if (headerElem) {
                          let drawer = headerElem.querySelector(".mobile-drawer-menu, .mobile-menu, [data-mobile-drawer]") as HTMLElement;
                          if (!drawer) {
                            drawer = document.createElement("div");
                            drawer.className = "mobile-drawer-menu active";
                            drawer.setAttribute("data-mobile-drawer", "true");
                            drawer.style.cssText = "display: block !important; width: 100%; background: #0b1120; border-top: 1px solid rgba(255,255,255,0.1); padding: 16px 20px; margin-top: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); position: relative; z-index: 99;";
                            drawer.innerHTML = `
                              <nav style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700;">
                                <a href="/home" style="color: #ffffff; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Home</a>
                                <a href="/about" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">About Us</a>
                                <a href="/academics" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Academics & Courses</a>
                                <a href="/admissions" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Admissions</a>
                                <a href="/placements" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Placements & Careers</a>
                                <a href="/contact" style="color: #cbd5e1; text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">Contact Helpdesk</a>
                              </nav>
                            `;
                            headerElem.appendChild(drawer);
                          } else {
                            const isCurrentlyHidden = drawer.style.display === "none" || !drawer.classList.contains("active");
                            if (isCurrentlyHidden) {
                              drawer.classList.add("active");
                              drawer.style.setProperty("display", "block", "important");
                            } else {
                              drawer.classList.remove("active");
                              drawer.style.setProperty("display", "none", "important");
                            }
                          }
                        }
                        return;
                      }
                    }

                    if (target && (target.tagName === "IMG" || target.getAttribute("data-logo") === "true" || (target.className || "").toString().toLowerCase().includes("logo"))) {
                      handleSectionContextMenu(e, idx);
                    }
                  }}
                  onDoubleClick={(e) => handleSectionDoubleClick(e, idx)}
                  onContextMenu={(e) => handleSectionContextMenu(e, idx)}
                  className={`w-full cursor-pointer relative transition-all group section-wrapper-container overflow-hidden ${
                    activeSectionIndex === idx ? "ring-2 ring-white ring-offset-2 ring-offset-black z-10" : ""
                  }`}
                >
                  {/* Top-Right Small Section Badge Pill with Red Star Icon (Matching Image) */}
                  {activeSectionIndex === idx && (
                    <div className="absolute top-4 right-6 z-30 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#090d16] border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-md select-none transition-all duration-200">
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#ef4444" stroke="#dc2626" strokeWidth="1">
                        <path d="M12 2L14.8 8.6L22 9.2L16.5 13.8L18.2 20.8L12 17L5.8 20.8L7.5 13.8L2 9.2L9.2 8.6L12 2Z" />
                      </svg>
                      <span className="text-[12px] font-extrabold text-white tracking-wide whitespace-nowrap">
                        {sec.title || `Section ${idx + 1}`}
                      </span>
                    </div>
                  )}

                  <div
                    dangerouslySetInnerHTML={{ __html: cleanFullWebCodeForCanvas(sec.code, viewportWidth) }}
                    className={`w-full overflow-hidden ${
                      idx === 0 || sec.category === "navbar" || sec.category === "header"
                        ? "block p-0 m-0 text-left [&>*:first-child]:w-full"
                        : "flex flex-col items-center justify-center text-center [&>*:first-child]:w-full [&>*:first-child]:mx-auto"
                    }`}
                  />
                </div>
              ))}

              {/* Empty Space + Add Section Button */}
              <div className="w-full max-w-full py-10 px-4 flex items-center justify-center text-center bg-zinc-950/80 border-t border-b border-dashed border-zinc-800 my-6 rounded-2xl">
                <AddSectionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddSectionModal(true);
                  }}
                  label="Add Section"
                  size="md"
                />
              </div>

              {/* Bottom Clearance Spacer for Floating Dock */}
              <div className="w-full h-48 bg-transparent pointer-events-none shrink-0" />
            </div>
          )}
        </div>
      </main>

      {/* Select Section Category Modal */}
      {showAddSectionModal && (
        <div
          onClick={() => setShowAddSectionModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-zinc-950/95 rounded-3xl p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col max-h-[85vh] overflow-hidden border border-zinc-800 text-white cursor-default relative animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 shrink-0">
              <div>
                <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>What section do you want to add?</span>
                </h3>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  Select a category or specific Admin section variant to append to your page layout.
                </p>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all font-black text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 pt-2 pb-2 custom-scrollbar">
              {/* Quick Action: Load All 19 Default Sections */}
              <button
                onClick={() => {
                  const all19 = getAll19DefaultSections(currentPage.slug);
                  setSections(all19);
                  setActiveSectionIndex(0);
                  setShowAddSectionModal(false);
                }}
                className="w-full p-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs flex items-center justify-center gap-2.5 shadow-xl border border-white transition-all hover:scale-[1.01] cursor-pointer select-none"
              >
                
                <span>⚡ Load All 19 Default Sections (Full Website Layout)</span>
              </button>

              {/* Admin DB Section Variants List */}
              {adminDbTemplates.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                    <h4 className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">
                      Admin DB Section Variants ({adminDbTemplates.length})
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-zinc-500">Live Backend Database</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {adminDbTemplates.map((tpl) => (
                      <div
                        key={tpl.id || tpl.name}
                        onClick={() => {
                          const newSection: SectionItem = {
                            id: `sec-${Date.now()}`,
                            title: tpl.name,
                            code: tpl.code,
                            variantIndex: 0,
                          };
                          setSections((prev) => [...prev, newSection]);
                          setActiveSectionIndex(sections.length);
                          setShowAddSectionModal(false);
                        }}
                        className="group flex items-center justify-between p-3.5 rounded-2xl bg-black/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-500 transition-all duration-200 cursor-pointer shadow-sm select-none"
                      >
                        <div className="truncate pr-3">
                          <h5 className="text-xs font-black text-white group-hover:text-white truncate tracking-tight">{tpl.name}</h5>
                          <p className="text-[10px] text-zinc-400 font-mono font-bold mt-0.5">Live DB Template</p>
                        </div>
                        <span className="text-[10px] font-black bg-white text-black px-3.5 py-1.5 rounded-full shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          + Add
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Built-in Category Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                  <h4 className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">
                    All Built-in Categories (19)
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-zinc-500">Standard Templates</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {SECTION_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const hasAdminTemplate = adminDbTemplates.some((tpl) => {
                      const nameLower = (tpl.name || "").toLowerCase();
                      return nameLower.includes(`[${cat.id}]`) || nameLower.includes(cat.id) || nameLower.includes(cat.name.toLowerCase());
                    });

                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleAddSectionFromCategory(cat)}
                        className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/90 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-500 transition-all duration-200 cursor-pointer select-none overflow-hidden shadow-sm hover:shadow-md"
                      >
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 group-hover:bg-white text-white group-hover:text-black border border-zinc-800 group-hover:border-white transition-all flex items-center justify-center shrink-0 shadow-sm">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-black text-white group-hover:text-white truncate tracking-tight">{cat.name}</h4>
                            {hasAdminTemplate && (
                              <span className="text-[9px] font-mono font-extrabold text-zinc-300 bg-zinc-800/90 px-2.5 py-0.5 rounded-full border border-zinc-700 shrink-0">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 mt-0.5 font-medium truncate leading-normal">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Drawer Panel */}
      <DrawerPanel
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onPageSelect={handlePageChange}
        onPaletteSelect={handlePaletteSelect}
        onFontSelect={handleFontSelect}
      />

      {/* Domain Settings Modal */}
      <DomainSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        subdomain={subdomain}
        initialTab={settingsTab}
      />

      {/* Floating Bottom Toolbar Dock - Hidden when Settings Studio is open */}
      {!isSettingsOpen && (
        <EditorToolbar
          subdomain={subdomain}
          onOpenSettings={() => setIsSettingsOpen(!isSettingsOpen)}
          isSettingsOpen={isSettingsOpen}
          onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
          viewportWidth={viewportWidth}
          setViewportWidth={setViewportWidth}
          activeSectionTitle={activeSectionIndex !== null && sections[activeSectionIndex] ? sections[activeSectionIndex]?.title : "Hero"}
          hasSections={sections.length > 0}
          isSectionSelected={activeSectionIndex !== null}
          onAddSection={() => setShowAddSectionModal(true)}
          onDuplicateSection={handleDuplicateSection}
          onSwapVariant={handleSwapVariant}
          onEditText={handleEnableTextEditingForActiveSection}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyStack.length > 0}
          canRedo={redoStack.length > 0}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDeleteSection={handleDeleteSection}
          onSyncAdminWebsite={handlePersistWebsiteSave}
        />
      )}

      {/* Floating Right-Click Button URL Navigation Popup */}
      {linkPopup && (
        <div
          onClick={() => setLinkPopup(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            boxSizing: "border-box",
          }}
          className="select-none cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "440px",
              maxWidth: "92vw",
              backgroundColor: "#000000",
              border: "1px solid #27272a",
              borderRadius: "24px",
              padding: "24px 28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.95)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxSizing: "border-box",
            }}
            className="text-white text-xs cursor-default"
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #27272a",
                paddingBottom: "14px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                  }}
                />
                <span style={{ fontSize: "16px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.01em" }}>
                  Button Navigation URL
                </span>
              </div>
              <button
                onClick={() => setLinkPopup(null)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#a1a1aa",
                  fontSize: "14px",
                  fontWeight: 900,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 800, color: "#e4e4e7" }}>
                  Target URL / Link Path
                </label>
                <input
                  type="text"
                  value={linkPopup.currentUrl}
                  onChange={(e) => setLinkPopup({ ...linkPopup, currentUrl: e.target.value })}
                  placeholder="e.g. https://greenfield.edu.in/apply or #contact"
                  style={{
                    width: "100%",
                    height: "46px",
                    backgroundColor: "#09090b",
                    border: "1px solid #3f3f46",
                    borderRadius: "14px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    fontSize: "13px",
                    color: "#ffffff",
                    fontFamily: "monospace",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Quick Page Preset Links */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 900, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  QUICK PAGE PRESETS
                </label>
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" }}>
                  {["/home", "/about", "/academics", "/contact", "/placements"].map((slug) => (
                    <button
                      key={slug}
                      onClick={() => setLinkPopup({ ...linkPopup, currentUrl: slug })}
                      style={{
                        fontSize: "12px",
                        fontFamily: "monospace",
                        fontWeight: 800,
                        padding: "6px 14px",
                        borderRadius: "10px",
                        backgroundColor: linkPopup.currentUrl === slug ? "#ffffff" : "#18181b",
                        color: linkPopup.currentUrl === slug ? "#000000" : "#a1a1aa",
                        border: linkPopup.currentUrl === slug ? "1px solid #ffffff" : "1px solid #27272a",
                        cursor: "pointer",
                      }}
                    >
                      {slug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Open in New Tab Toggle */}
              <label style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", cursor: "pointer", paddingTop: "4px" }}>
                <input
                  type="checkbox"
                  checked={linkPopup.isNewTab}
                  onChange={(e) => setLinkPopup({ ...linkPopup, isNewTab: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#ffffff", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#e4e4e7" }}>
                  Open in New Tab (<code style={{ color: "#ffffff", fontFamily: "monospace" }}>target="_blank"</code>)
                </span>
              </label>

              {/* Action Buttons */}
              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid #27272a",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "12px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <button
                  onClick={() => setLinkPopup(null)}
                  style={{
                    height: "42px",
                    paddingLeft: "18px",
                    paddingRight: "18px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#a1a1aa",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveButtonUrl(linkPopup.currentUrl, linkPopup.isNewTab)}
                  style={{
                    height: "42px",
                    paddingLeft: "22px",
                    paddingRight: "22px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    fontSize: "13px",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxShadow: "0 8px 16px -4px rgba(37,99,235,0.4)",
                  }}
                >
                  <span>🔗 Save Button URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎨 Streamlined Auto Right-Click Context-Aware Customizer Modal (Sleek Black & White Theme) */}
      {imagePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setImagePopup(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#000000",
              border: "1px solid #27272a",
              borderRadius: "24px",
              padding: "24px 28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.95)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              color: "#ffffff",
              fontFamily: "system-ui, -apple-system, sans-serif",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
            className="cursor-default text-xs"
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderBottom: "1px solid #27272a", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                  }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 900, margin: 0, color: "#ffffff", letterSpacing: "-0.01em" }}>
                      {imagePopup.targetType === "logo" ? "Edit Logo & Branding" : imagePopup.targetType === "background" ? "Edit Section Background" : "Edit Image"}
                    </h3>
                    <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#18181b", color: "#a1a1aa", border: "1px solid #27272a", textTransform: "uppercase" }}>
                      AUTO-{imagePopup.targetType}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#71717a", margin: "2px 0 0 0" }}>
                    Changes apply immediately & auto-save automatically ⚡
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImagePopup(null)}
                style={{ backgroundColor: "transparent", border: "none", color: "#a1a1aa", fontSize: "14px", fontWeight: 900, cursor: "pointer", padding: "4px 8px", borderRadius: "8px" }}
              >
                ✕
              </button>
            </div>

            {/* Target Navigation Bar ("NAV TO THE LOGOS") - ONLY Shown for Logo Target */}
            {imagePopup.targetType === "logo" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#09090b", padding: "10px 14px", borderRadius: "14px", border: "1px solid #27272a" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#a1a1aa", display: "flex", alignItems: "center", gap: "6px" }}>
                  🎯 Target Navigation:
                </span>
                <button
                  onClick={handleJumpToNavbarLogo}
                  style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "10px", padding: "6px 14px", fontSize: "11px", fontWeight: 900, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  🚀 Nav to Navbar Logo
                </button>
              </div>
            )}

            {/* Streamlined Direct Inputs Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* 1. File Upload from Device */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  {imagePopup.targetType === "logo" ? "Upload Logo Image File" : imagePopup.targetType === "background" ? "Upload Background Image File" : "Upload Image File from Device"}
                </label>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "44px", backgroundColor: "#09090b", border: "1px dashed #3f3f46", borderRadius: "12px", color: "#ffffff", fontSize: "13px", fontWeight: 800, cursor: "pointer", transition: "all 0.15s ease" }}>
                  <span>📁 Select Image File from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (typeof ev.target?.result === "string") {
                            handleUpdateAndSaveImage({ imageUrl: ev.target.result });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* 2. Custom Image / Background / Logo URL Input */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  {imagePopup.targetType === "logo" ? "Logo Image URL" : imagePopup.targetType === "background" ? "Background Image URL" : "Image URL"}
                </label>
                <input
                  type="text"
                  value={imagePopup.imageUrl}
                  onChange={(e) => handleUpdateAndSaveImage({ imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/your-image.jpg"
                  style={{ width: "100%", height: "42px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* 3. Logo Specific Destination Link & Sync Toggle */}
              {imagePopup.targetType === "logo" && (
                <>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      Logo Navigation Destination (URL / Link)
                    </label>
                    <input
                      type="text"
                      value={imagePopup.linkUrl}
                      onChange={(e) => handleUpdateAndSaveImage({ linkUrl: e.target.value })}
                      placeholder="/home or https://yourcollege.edu.in"
                      style={{ width: "100%", height: "42px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#09090b", padding: "10px 14px", borderRadius: "12px", border: "1px solid #27272a", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={imagePopup.applyAllLogos}
                      onChange={(e) => handleUpdateAndSaveImage({ applyAllLogos: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "#ffffff", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>
                      ⚡ Apply logo change to ALL header navbars across site
                    </span>
                  </label>
                </>
              )}

              {/* 4. Section Background Specific Sync Toggle */}
              {imagePopup.targetType === "background" && (
                <label style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#09090b", padding: "10px 14px", borderRadius: "12px", border: "1px solid #27272a", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={imagePopup.applyAllBackgrounds}
                    onChange={(e) => handleUpdateAndSaveImage({ applyAllBackgrounds: e.target.checked })}
                    style={{ width: "16px", height: "16px", accentColor: "#ffffff", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>
                    Apply background image to ALL sections on this page
                  </span>
                </label>
              )}

            </div>

            {/* Footer Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingTop: "14px", borderTop: "1px solid #27272a" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#22c55e", display: "flex", alignItems: "center", gap: "6px" }}>
                ✓ Auto-Saved & Live Updated ⚡
              </span>
              <button
                onClick={() => setImagePopup(null)}
                style={{ height: "40px", padding: "0 22px", borderRadius: "12px", backgroundColor: "#ffffff", color: "#000000", fontWeight: 900, border: "none", cursor: "pointer", fontSize: "13px", boxShadow: "0 4px 12px rgba(255,255,255,0.15)" }}
              >
                Close Modal ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📍 Sleek Black & White Map Location & Navigation Customizer Modal */}
      {mapPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setMapPopup(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#000000",
              border: "1px solid #27272a",
              borderRadius: "24px",
              padding: "24px 28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.95)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              color: "#ffffff",
              fontFamily: "system-ui, -apple-system, sans-serif",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
            className="cursor-default text-xs"
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderBottom: "1px solid #27272a", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                  }}
                />
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 900, margin: 0, color: "#ffffff", letterSpacing: "-0.01em" }}>
                    Edit Campus Map & Location
                  </h3>
                  <p style={{ fontSize: "11px", color: "#71717a", margin: "2px 0 0 0" }}>
                    Changes apply immediately & auto-save automatically ⚡
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMapPopup(null)}
                style={{ backgroundColor: "transparent", border: "none", color: "#a1a1aa", fontSize: "14px", fontWeight: 900, cursor: "pointer", padding: "4px 8px", borderRadius: "8px" }}
              >
                ✕
              </button>
            </div>

            {/* Quick Location Presets */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Quick Location Presets
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {[
                  { name: "VIT Vellore Main Campus", query: "Vellore Institute of Technology" },
                  { name: "Chennai Campus", query: "Vellore Institute of Technology Chennai" },
                  { name: "Anna University", query: "Anna University Guindy Chennai" },
                  { name: "IIT Madras", query: "IIT Madras Chennai" },
                  { name: "SRM Kattankulathur", query: "SRM Institute of Science and Technology" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      const cleanEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(preset.query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
                      const cleanDirections = `https://maps.google.com/?q=${encodeURIComponent(preset.query)}`;
                      handleUpdateAndSaveMap({
                        mapEmbedUrl: cleanEmbed,
                        directionsUrl: cleanDirections,
                        locationName: preset.name.toUpperCase(),
                      });
                    }}
                    style={{
                      backgroundColor: "#09090b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      color: "#e4e4e7",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    📍 {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Input Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* 1. Google Maps Embed URL */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Google Maps Embed URL / iFrame Source
                </label>
                <input
                  type="text"
                  value={mapPopup.mapEmbedUrl}
                  onChange={(e) => handleUpdateAndSaveMap({ mapEmbedUrl: e.target.value })}
                  placeholder="https://maps.google.com/maps?q=YourCollege&output=embed"
                  style={{ width: "100%", height: "42px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* 2. Directions Button Link URL */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Get Directions Button Link (URL)
                </label>
                <input
                  type="text"
                  value={mapPopup.directionsUrl}
                  onChange={(e) => handleUpdateAndSaveMap({ directionsUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=YourCollege"
                  style={{ width: "100%", height: "42px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* 3. Campus Title Name */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Campus Location Name
                </label>
                <input
                  type="text"
                  value={mapPopup.locationName}
                  onChange={(e) => handleUpdateAndSaveMap({ locationName: e.target.value })}
                  placeholder="VELLORE INSTITUTE OF TECHNOLOGY"
                  style={{ width: "100%", height: "42px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingTop: "14px", borderTop: "1px solid #27272a" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#22c55e", display: "flex", alignItems: "center", gap: "6px" }}>
                ✓ Auto-Saved & Live Updated ⚡
              </span>
              <button
                onClick={() => setMapPopup(null)}
                style={{ height: "40px", padding: "0 22px", borderRadius: "12px", backgroundColor: "#ffffff", color: "#000000", fontWeight: 900, border: "none", cursor: "pointer", fontSize: "13px", boxShadow: "0 4px 12px rgba(255,255,255,0.15)" }}
              >
                Close Modal ✕
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
