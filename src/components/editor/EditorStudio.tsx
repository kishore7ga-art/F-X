"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Eye,
  Sparkles,
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
}

const SECTION_CATEGORIES = [
  { id: "navbar", name: "Navbar / Header", description: "Top navigation bar with logo, menu links & action buttons", icon: Compass },
  { id: "hero", name: "Hero Banner", description: "Lead banner, masthead & title headline", icon: Layout },
  { id: "highlights", name: "College Highlights", description: "Key stats, NIRF rankings & accreditation badges", icon: Sparkles },
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
  navbar: `<header style="background: #0d1527; color: #ffffff; padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-bottom: 1px solid rgba(255,255,255,0.1);">
    <div style="display: flex; align-items: center; gap: 12px;">
      <img src="https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80" alt="College Emblem" data-logo="true" style="width: 42px; height: 42px; object-fit: cover; border-radius: 10px; background: #ffffff; padding: 2px; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;" title="Right-click to change logo image!" />
      <span style="font-size: 20px; font-weight: 900; color: #ffffff;">GREENFIELD UNIVERSITY</span>
    </div>
    <nav style="display: flex; gap: 24px; font-size: 14px; font-weight: 700;">
      <a href="#about" style="color: #cbd5e1; text-decoration: none;">About</a>
      <a href="#courses" style="color: #cbd5e1; text-decoration: none;">Academics</a>
      <a href="#admissions" style="color: #cbd5e1; text-decoration: none;">Admissions</a>
      <a href="#placements" style="color: #cbd5e1; text-decoration: none;">Placements</a>
      <a href="#contact" style="color: #cbd5e1; text-decoration: none;">Contact</a>
    </nav>
    <a href="#apply" style="background: #2563eb; color: #ffffff; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 800; text-decoration: none;">Apply Now</a>
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

  map: `<section style="background: #0f172a; color: #ffffff; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 32px; font-weight: 900;">Campus Location & Directions</h2>
      <p style="font-size: 14px; color: #94a3b8; margin-top: 8px;">Greenfield Campus, Knowledge Park III, Tech City - 600001</p>
      <div style="width: 100%; height: 260px; background: #1e293b; border-radius: 20px; border: 1px solid #334155; margin-top: 28px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #38bdf8;">📍 Interactive Google Map View</div>
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

const getFullPageSections = (slug: string, pageName: string = "Home", collegeName: string = "MEC ENGINEERING COLLEGE"): SectionItem[] => {
  const cleanSlug = slug.replace(/^\//, "").toLowerCase();

  const sharedHeader = `<header style="background: #0d1527; color: #ffffff; padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-bottom: 1px solid rgba(255,255,255,0.1);">
    <div style="display: flex; align-items: center; gap: 12px;">
      <img src="https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80" alt="College Emblem" data-logo="true" style="width: 42px; height: 42px; object-fit: cover; border-radius: 10px; background: #ffffff; padding: 2px; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;" title="Right-click to change logo image!" />
      <div>
        <span style="font-size: 18px; font-weight: 900; color: #ffffff; display: block; line-height: 1.2;">${collegeName.toUpperCase()}</span>
        <span style="font-size: 11px; font-weight: 600; color: #94a3b8;">Autonomous • NAAC A++ Accredited</span>
      </div>
    </div>
    <nav style="display: flex; gap: 24px; font-size: 14px; font-weight: 700;">
      <a href="/home" style="color: #cbd5e1; text-decoration: none;">Home</a>
      <a href="/about" style="color: #cbd5e1; text-decoration: none;">About</a>
      <a href="/academics" style="color: #cbd5e1; text-decoration: none;">Academics</a>
      <a href="/admissions" style="color: #cbd5e1; text-decoration: none;">Admissions</a>
      <a href="/placements" style="color: #cbd5e1; text-decoration: none;">Placements</a>
      <a href="/contact" style="color: #cbd5e1; text-decoration: none;">Contact</a>
    </nav>
    <a href="/admissions" style="background: #2563eb; color: #ffffff; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 800; text-decoration: none;">Apply Now</a>
  </header>`;

  const sharedFooter = `<footer style="background: #050810; color: #ffffff; padding: 60px 24px 40px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-top: 1px solid rgba(255,255,255,0.1);">
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

  // Undo & Redo History Stack Handlers
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previousState = historyStack[historyStack.length - 1]!;
    setRedoStack((prev) => [...prev, sections]);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setSections(previousState);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1]!;
    setHistoryStack((prev) => [...prev, sections]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setSections(nextState);
  };

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

  // Dynamic Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToastNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
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

  // Strip out canvas wrapper divs, containment styles, and html entity pollution from section code
  const cleanCanvasWrapperFromCode = (rawCode: string): string => {
    if (!rawCode) return "";

    let clean = rawCode;

    // 1. Remove canvas containment <style> blocks
    clean = clean.replace(/<style[^>]*>[\s\S]*?\.section-canvas-box[\s\S]*?<\/style>/gi, "");

    // 2. Un-escape HTML entities if present (&lt;, &gt;, &amp;)
    clean = clean.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

    // 3. Strip outer wrapper divs injected by canvas rendering ([&>*:first-child], section-canvas-box, section-wrapper-container)
    clean = clean.replace(/^<div[^>]*class="[^"]*(?:section-canvas-box|section-wrapper-container|items-center|overflow-hidden)[^"]*"[^>]*>([\s\S]*)<\/div>$/i, (_match, inner) => {
      return inner ? inner.trim() : _match;
    });

    // 4. Strip nested wrapper divs containing [&>*:first-child] or section-canvas-box
    clean = clean.replace(/<div[^>]*class="[^"]*\[&[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, "$1");
    clean = clean.replace(/<div[^>]*class="[^"]*section-canvas-box[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, "$1");

    // 5. Strip any top-level wrapper div with w-full overflow-hidden flex flex-col
    clean = clean.replace(/^<div[^>]*class="[^"]*w-full overflow-hidden flex flex-col[^"]*"[^>]*>([\s\S]*)<\/div>$/i, "$1");

    return clean.trim();
  };

  // Handle full-page Color Theme Palette Switch across all sections
  const handlePaletteSelect = (paletteId: string) => {
    setActivePalette(paletteId);

    const PALETTES_MAP: Record<string, { primary: string; accent: string; headerBg: string }> = {
      "academic-blue": { primary: "#0f172a", accent: "#2563eb", headerBg: "#0d1527" },
      "emerald-gold": { primary: "#064e3b", accent: "#f59e0b", headerBg: "#022c22" },
      "crimson-slate": { primary: "#881337", accent: "#e11d48", headerBg: "#4c0519" },
      "midnight-purple": { primary: "#180828", accent: "#a855f7", headerBg: "#0d0418" },
      "light-minimal": { primary: "#ffffff", accent: "#0f172a", headerBg: "#ffffff" },
    };

    const target = PALETTES_MAP[paletteId] || PALETTES_MAP["academic-blue"]!;

    // Transform color scheme across all sections
    setSections((prevSections) =>
      prevSections.map((sec) => {
        let code = sec.code;
        // Swap primary button background colors & accent highlights
        code = code
          .replace(/background:\s*#(2563eb|ef4444|000000|0f172a|881337|064e3b|a855f7|f59e0b)/gi, `background: ${target.accent}`)
          .replace(/background-color:\s*#(2563eb|ef4444|000000|0f172a|881337|064e3b|a855f7|f59e0b)/gi, `background-color: ${target.accent}`)
          .replace(/border-color:\s*#(2563eb|ef4444|000000|0f172a|881337|064e3b|a855f7|f59e0b)/gi, `border-color: ${target.accent}`)
          .replace(/<header style="background:\s*[^;]+;/gi, `<header style="background: ${target.headerBg};`)
          .replace(/<footer style="background:\s*[^;]+;/gi, `<footer style="background: ${target.primary};`);

        return { ...sec, code };
      })
    );
  };

  // Handle full-page Font Family Switch across all sections
  const handleFontSelect = (fontId: string) => {
    setActiveFont(fontId);

    const FONT_MAP: Record<string, string> = {
      inter: "'Inter', system-ui, -apple-system, sans-serif",
      serif: "'Playfair Display', Georgia, serif",
      outfit: "'Outfit', 'Roboto', system-ui, sans-serif",
    };

    const targetFont = FONT_MAP[fontId] || FONT_MAP["inter"]!;

    // Update font-family style attribute across all sections
    setSections((prevSections) =>
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
    const isMobile = width === "320px" || width === "375px" || width === "425px";
    const isTablet = width === "640px" || width === "768px" || width === "1024px";

    let corrected = code;

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
      }
      .section-canvas-box * {
        box-sizing: border-box !important;
      }
      .section-canvas-box img, .section-canvas-box video, .section-canvas-box iframe, .section-canvas-box svg {
        max-width: 100% !important;
      }
      .section-canvas-box > div,
      .section-canvas-box > header,
      .section-canvas-box > section,
      .section-canvas-box > nav {
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .section-canvas-box [style*="position: fixed"], .section-canvas-box [style*="position:fixed"],
      .section-canvas-box [style*="position: sticky"], .section-canvas-box [style*="position:sticky"] {
        position: relative !important;
        top: auto !important;
      }
    </style>`;

    return `${containmentStyles}<div class="section-canvas-box">${autoCorrectMobileCode(cleanCode, width)}</div>`;
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

  // Fetch sections & admin DB templates
  const fetchDbSections = async (slug: string = "/home", forceSync: boolean = false) => {
    setLoadingDb(true);
    try {
      // 1. First check localStorage and pageStore for user's saved sections before calling default-website API
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
            setSections(savedSecs);
            setActiveSectionIndex(0);
            setLoadingDb(false);
            return;
          }
        } catch (err) {
          console.warn("Could not load saved sections from localStorage:", err);
        }
      }

      const apiBase = (() => {
        if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
        if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
        if (
          typeof window !== "undefined" &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1"
        ) {
          return "https://api.xite.co.in";
        }
        return "http://localhost:4000";
      })();

      // 2. Fetch Admin-configured Default Website Structure for new pages (All 19 Admin Sections)
      try {
        const defRes = await fetch(`${apiBase}/api/v1/default-website`);
        if (defRes.ok) {
          const defData = await defRes.json().catch(() => ({}));
          if (defData && Array.isArray(defData.pages)) {
            const cleanTargetSlug = slug.toLowerCase().replace(/^\//, "");
            const matchedPage = defData.pages.find((p: any) => {
              const pSlug = (p.slug || "").toLowerCase().replace(/^\//, "");
              const pName = (p.title || p.name || "").toLowerCase();
              return (
                pSlug === cleanTargetSlug ||
                pName === cleanTargetSlug ||
                (cleanTargetSlug === "home" && (pSlug === "" || pSlug === "home" || pName.includes("home")))
              );
            });

            if (matchedPage && matchedPage.sections && matchedPage.sections.length > 0) {
              const loadedSections: SectionItem[] = matchedPage.sections.map((sec: any, idx: number) => ({
                id: sec.id || `def-${idx}`,
                title: sec.title || `Section #${idx + 1}`,
                code: sec.code,
                variantIndex: 0,
              }));

              setSections(loadedSections);
              setActiveSectionIndex(0);
              setPageStore((prev) => ({ ...prev, [slug]: loadedSections }));
              if (typeof window !== "undefined") {
                try {
                  localStorage.setItem("xite_saved_pages", JSON.stringify({ ...pageStore, [slug]: loadedSections }));
                } catch {}
              }
              setLoadingDb(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Could not load default website config:", err);
      }

      let fetchedTemplates: any[] = [];
      try {
        const res = await fetch(`${apiBase}/api/v1/admin/templates`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && data.templates && data.templates.length > 0) {
            fetchedTemplates = data.templates;
            setAdminDbTemplates(data.templates);
          }
        }
      } catch {}

      // 3. Fallback to complete full-page sections if no saved page or Admin config match
      const fullPageSecs = getFullPageSections(slug, currentPage.name, collegeName);
      setSections(fullPageSecs);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    void fetchDbSections(currentPage.slug);
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

    // Load complete multi-section full-page website for target page
    const fullPageSecs = getFullPageSections(pageSlug, pageName, collegeName);
    setSections(fullPageSecs);
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
    const target = e.target as HTMLElement;
    if (!target) return;

    // Tags that can be edited inline
    const editableTags = ["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "A", "BUTTON", "LI", "STRONG", "EM", "B", "I", "TD", "TH"];

    let textElem: HTMLElement | null = target;
    while (textElem && textElem !== e.currentTarget && !editableTags.includes(textElem.tagName)) {
      textElem = textElem.parentElement;
    }

    if (!textElem || textElem === e.currentTarget) {
      textElem = target;
    }

    // Enable inline content editing
    textElem.contentEditable = "true";
    textElem.focus();

    // Visual editing indicator highlight
    textElem.style.outline = "2px dashed #2563eb";
    textElem.style.outlineOffset = "4px";
    textElem.style.borderRadius = "4px";

    e.stopPropagation();

    const container = e.currentTarget;

    const saveUpdatedContent = () => {
      textElem!.contentEditable = "false";
      textElem!.style.outline = "";
      textElem!.style.outlineOffset = "";
      textElem!.style.borderRadius = "";

      // Clean up contentEditable attributes before saving HTML to user's local page state
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

      const newCode = clone.innerHTML;
      if (newCode) {
        setSections((prev) =>
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

    // 1. Live DOM manipulation for immediate visual response on screen
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

    // 2. Direct string update in section HTML code & auto-save across state & localStorage
    setSections((prevSections) => {
      return prevSections.map((sec, idx) => {
        let newCode = sec.code;

        if (targetType === "logo") {
          if (finalImageUrl) {
            if (updatedPopup.applyAllLogos) {
              newCode = newCode.replace(/(<img[^>]*data-logo="true"[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
              newCode = newCode.replace(/(<img[^>]*alt="[^"]*Emblem[^"]*"[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
              newCode = newCode.replace(/(<img[^>]*class="[^"]*logo[^"]*"[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
            } else if (idx === sectionIndex) {
              if (originalUrl && newCode.includes(originalUrl)) {
                newCode = newCode.replaceAll(originalUrl, finalImageUrl);
              } else {
                newCode = newCode.replace(/(<img[^>]*data-logo="true"[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
                newCode = newCode.replace(/(<img[^>]*class="[^"]*logo[^"]*"[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
              }
            }
          }
          if (finalLinkUrl && idx === sectionIndex) {
            newCode = newCode.replace(/(<a[^>]*class="[^"]*logo[^"]*"[^>]*href=")[^"]*(")/gi, `$1${finalLinkUrl}$2`);
          }
          return { ...sec, code: cleanCanvasWrapperFromCode(newCode) };
        }

        if (targetType === "background") {
          if (finalImageUrl) {
            if (updatedPopup.applyAllBackgrounds) {
              newCode = newCode.replace(/background-image:\s*url\([^)]+\)/gi, `background-image: url("${finalImageUrl}")`);
            } else if (idx === sectionIndex) {
              if (originalUrl && newCode.includes(originalUrl)) {
                newCode = newCode.replaceAll(originalUrl, finalImageUrl);
              }
              newCode = newCode.replace(/(background(?:-image)?:\s*url\(["']?)[^"')]+(["']?\))/gi, `$1${finalImageUrl}$2`);
            }
          }
          return { ...sec, code: cleanCanvasWrapperFromCode(newCode) };
        }

        if (targetType === "image" && idx === sectionIndex) {
          if (finalImageUrl) {
            if (originalUrl && newCode.includes(originalUrl)) {
              newCode = newCode.replaceAll(originalUrl, finalImageUrl);
            } else {
              newCode = newCode.replace(/(<img[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
            }
          }
          return { ...sec, code: cleanCanvasWrapperFromCode(newCode) };
        }

        return sec;
      });
    });

    showToastNotification("⚡ Image & Logo updated & auto-saved!");
  };

  // Right-click handler for Images, Logos, Section Backgrounds, and Buttons
  const handleSectionContextMenu = (e: React.MouseEvent<HTMLDivElement>, sectionIndex: number) => {
    const target = e.target as HTMLElement;
    if (!target) return;

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
        setSections((prev) =>
          prev.map((sec, i) => (i === sectionIndex ? { ...sec, code: newCode } : sec))
        );
      }
    }

    setLinkPopup(null);
  };

  // Select section category in modal: Fetch latest Admin DB templates and insert exact Admin code!
  const handleSelectSectionCategory = async (cat: typeof SECTION_CATEGORIES[0]) => {
    setShowAddSectionModal(false);

    let templatesList = adminDbTemplates;

    // Fetch latest templates if empty
    if (templatesList.length === 0) {
      try {
        const res = await fetch("/api/v1/admin/templates", { credentials: "include" });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && data.templates) {
            templatesList = data.templates;
            setAdminDbTemplates(data.templates);
          }
        }
      } catch {}
    }

    // Filter admin-added templates matching selected category tag (e.g. [hero])
    const catIdLower = cat.id.toLowerCase();
    const catNameLower = cat.name.toLowerCase();
    const matchingTemplates = templatesList.filter((tpl) => {
      const nameLower = (tpl.name || "").toLowerCase();
      return (
        nameLower.includes(`[${catIdLower}]`) ||
        nameLower.includes(catIdLower) ||
        nameLower.includes(catNameLower)
      );
    });

    const targetTemplate = matchingTemplates.length > 0 ? matchingTemplates[0]! : (templatesList.length > 0 ? templatesList[0] : null);

    if (targetTemplate && targetTemplate.code) {
      const newSection: SectionItem = {
        id: `sec-${Date.now()}`,
        title: targetTemplate.name,
        code: targetTemplate.code,
        variantIndex: 0,
      };
      setSections((prev) => [...prev, newSection]);
      setActiveSectionIndex(sections.length);
    } else {
      const defaultCode = ALL_19_SECTION_TEMPLATES[cat.id] || DEFAULT_STARTER_CODE;
      const newSection: SectionItem = {
        id: `sec-${Date.now()}`,
        title: cat.name,
        code: defaultCode,
        variantIndex: 0,
      };
      setSections((prev) => [...prev, newSection]);
      setActiveSectionIndex(sections.length);
    }
  };

  // Swap / Cycle between admin-added section variants (e.g. hero 1 <-> hero 2) or layout variations
  const handleSwapVariant = async () => {
    if (activeSectionIndex === null || sections.length === 0) return;

    const activeSec = sections[activeSectionIndex];
    if (!activeSec) return;

    let templatesList = adminDbTemplates;

    // Fetch latest templates from API if empty
    if (templatesList.length === 0) {
      try {
        const res = await fetch("/api/v1/admin/templates", { credentials: "include" });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && data.templates && data.templates.length > 0) {
            templatesList = data.templates;
            setAdminDbTemplates(data.templates);
          }
        }
      } catch {}
    }

    // Determine category ID of active section (header, hero, stats, features, about, courses, placements, faculty, contact, footer)
    const titleLower = activeSec.title.toLowerCase();
    let catId = "hero";
    if (titleLower.includes("header") || titleLower.includes("nav")) catId = "header";
    else if (titleLower.includes("stat")) catId = "stats";
    else if (titleLower.includes("feature") || titleLower.includes("highlight")) catId = "features";
    else if (titleLower.includes("about")) catId = "about";
    else if (titleLower.includes("course") || titleLower.includes("academic")) catId = "courses";
    else if (titleLower.includes("placement") || titleLower.includes("career")) catId = "placements";
    else if (titleLower.includes("faculty") || titleLower.includes("staff")) catId = "faculty";
    else if (titleLower.includes("contact")) catId = "contact";
    else if (titleLower.includes("footer")) catId = "footer";
    else if (titleLower.includes("hero") || titleLower.includes("banner")) catId = "hero";

    // Filter DB templates matching active category ONLY
    const catTemplates = templatesList.filter((tpl) => {
      const nameLower = (tpl.name || "").toLowerCase();
      return (
        nameLower.includes(`[${catId}]`) ||
        nameLower.includes(catId) ||
        (catId === "header" && (nameLower.includes("header") || nameLower.includes("nav"))) ||
        (catId === "features" && (nameLower.includes("feature") || nameLower.includes("highlight"))) ||
        (catId === "stats" && (nameLower.includes("stat") || nameLower.includes("metric"))) ||
        (catId === "hero" && (nameLower.includes("hero") || nameLower.includes("banner"))) ||
        (catId === "courses" && (nameLower.includes("course") || nameLower.includes("academic"))) ||
        (catId === "about" && nameLower.includes("about")) ||
        (catId === "contact" && nameLower.includes("contact"))
      );
    });

    if (catTemplates.length > 0) {
      // Find current template index in available category templates
      const currentTplIdx = catTemplates.findIndex((tpl) => tpl.name === activeSec.title);
      const nextIdx = currentTplIdx >= 0 ? (currentTplIdx + 1) % catTemplates.length : (activeSec.variantIndex !== undefined ? (activeSec.variantIndex + 1) % catTemplates.length : 0);
      const nextTpl = catTemplates[nextIdx]!;

      setSections((prev) =>
        prev.map((sec, idx) => {
          if (idx !== activeSectionIndex) return sec;
          return {
            ...sec,
            title: nextTpl.name,
            code: nextTpl.code || sec.code,
            variantIndex: nextIdx,
          };
        })
      );
      showToast(`Swapped to ${catId.toUpperCase()} Admin Variant: "${nextTpl.name}"`);
      return;
    }

    // Fallback if no specific category DB template exists: Cycle visual layout variations of THIS SAME section without changing category/title
    const currentIdx = activeSec.variantIndex !== undefined ? activeSec.variantIndex : 0;
    const nextIdx = (currentIdx + 1) % 3;

    let newCode = activeSec.code;
    if (nextIdx === 1) {
      newCode = activeSec.code
        .replace(/text-align:\s*center/gi, "text-align: left")
        .replace(/margin:\s*0\s+auto/gi, "margin: 0");
    } else if (nextIdx === 2) {
      newCode = activeSec.code
        .replace(/background:\s*#000000/gi, "background: #0f172a")
        .replace(/background:\s*#09090b/gi, "background: #1e1b4b");
    } else {
      newCode = activeSec.code
        .replace(/text-align:\s*left/gi, "text-align: center")
        .replace(/background:\s*#0f172a/gi, "background: #000000")
        .replace(/background:\s*#1e1b4b/gi, "background: #000000");
    }

    const baseTitle = activeSec.title.split(" (Variant")[0];
    const newTitle = `${baseTitle} (Variant ${nextIdx + 1})`;

    setSections((prev) =>
      prev.map((sec, idx) => {
        if (idx !== activeSectionIndex) return sec;
        return {
          ...sec,
          title: newTitle,
          code: newCode,
          variantIndex: nextIdx,
        };
      })
    );
    showToast(`Swapped ${baseTitle} to Layout Variant ${nextIdx + 1}`);
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
    setSections((prev) => [
      ...prev.slice(0, activeSectionIndex + 1),
      duplicated,
      ...prev.slice(activeSectionIndex + 1),
    ]);
    setActiveSectionIndex(activeSectionIndex + 1);
  };

  const handleDeleteSection = () => {
    if (activeSectionIndex === null || sections.length === 0) return;
    setSections((prev) => prev.filter((_, idx) => idx !== activeSectionIndex));
    setActiveSectionIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
  };

  const handleMoveUp = () => {
    if (activeSectionIndex === null || activeSectionIndex <= 0) return;
    setSections((prev) => {
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
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[activeSectionIndex];
      copy[activeSectionIndex] = copy[activeSectionIndex + 1];
      copy[activeSectionIndex + 1] = temp;
      return copy;
    });
    setActiveSectionIndex((prev) => (prev !== null ? prev + 1 : null));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative overflow-x-hidden select-none">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Studio Canvas Workspace */}
      <main
        onClick={() => setActiveSectionIndex(null)}
        className={`flex-1 w-full flex flex-col items-center justify-start pb-64 cursor-pointer min-h-screen transition-all ${
          viewportWidth === "100%" ? "bg-white p-0 m-0" : "bg-slate-100/90 p-4 sm:p-8"
        }`}
      >
        <div
          className={`transition-all duration-300 flex flex-col items-center justify-start mx-auto bg-white overflow-hidden max-w-full ${
            viewportWidth === "100%"
              ? "w-full min-h-screen rounded-none border-none shadow-none m-0 p-0"
              : "min-h-[75vh] shadow-2xl rounded-2xl border border-slate-300 my-4"
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddSectionModal(true);
                }}
                className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>
          ) : (
            /* Pure Section Rendering for Current Page */
            <div className="w-full overflow-hidden">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSectionIndex(idx);
                    const target = e.target as HTMLElement;
                    if (target && (target.tagName === "IMG" || target.getAttribute("data-logo") === "true" || (target.className || "").toString().toLowerCase().includes("logo"))) {
                      handleSectionContextMenu(e, idx);
                    }
                  }}
                  onDoubleClick={(e) => handleSectionDoubleClick(e, idx)}
                  onContextMenu={(e) => handleSectionContextMenu(e, idx)}
                  className={`w-full cursor-pointer relative transition-all group section-wrapper-container overflow-hidden ${
                    activeSectionIndex === idx ? "ring-2 ring-blue-600 ring-offset-2 z-10" : ""
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: cleanFullWebCodeForCanvas(sec.code, viewportWidth) }}
                    className="w-full overflow-hidden flex flex-col items-center justify-center text-center [&>*:first-child]:w-full [&>*:first-child]:mx-auto"
                  />
                </div>
              ))}

              {/* Empty Space + Add Section Button */}
              <div className="w-full py-12 flex flex-col items-center justify-center bg-slate-50/70 border-t border-b border-dashed border-slate-300 my-6 rounded-2xl">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddSectionModal(true);
                  }}
                  className="group flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-black text-xs px-6 py-3 rounded-full shadow-lg transition-all border border-slate-700 hover:scale-105 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Add Section</span>
                </button>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 cursor-default relative animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">What section do you want to add?</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Select a category or specific Admin section variant.</p>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="flex-1 overflow-y-auto pr-1.5 space-y-6 pt-4 pb-2">
              {/* Admin DB Section Variants List */}
              {adminDbTemplates.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                    Admin DB Section Variants ({adminDbTemplates.length})
                  </h4>
                  <div className="grid gap-2.5 sm:grid-cols-2">
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
                        className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/90 transition-all cursor-pointer flex items-center justify-between shadow-sm select-none"
                      >
                        <div className="truncate pr-2">
                          <h5 className="text-xs font-black text-slate-900 truncate">{tpl.name}</h5>
                          <p className="text-[10px] text-emerald-700 font-mono font-bold">Live DB Template</p>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-600 text-white px-3 py-1 rounded-full shrink-0 shadow-sm">
                          + Add
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Built-in Category Grid */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                  All Built-in Categories (19)
                </h4>
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {SECTION_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const hasAdminTemplate = adminDbTemplates.some((tpl) => {
                      const nameLower = (tpl.name || "").toLowerCase();
                      return nameLower.includes(`[${cat.id}]`) || nameLower.includes(cat.id) || nameLower.includes(cat.name.toLowerCase());
                    });

                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectSectionCategory(cat)}
                        className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-500 transition-all duration-200 cursor-pointer select-none shadow-sm hover:shadow-md flex items-start gap-3.5 group"
                      >
                        <div className="p-3 rounded-2xl bg-slate-900 text-white group-hover:bg-blue-600 transition-colors shadow-sm shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-950 truncate">{cat.name}</h4>
                            {hasAdminTemplate && (
                              <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{cat.description}</p>
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
          onUndo={handleUndo}
          onRedo={handleRedo}
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
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
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
              backgroundColor: "#0b1222",
              border: "1px solid #2563eb",
              borderRadius: "24px",
              padding: "24px 28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 25px rgba(37, 99, 235, 0.25)",
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
                borderBottom: "1px solid #1e293b",
                paddingBottom: "14px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                    boxShadow: "0 0 10px #3b82f6",
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
                  color: "#94a3b8",
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
                <label style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 800, color: "#cbd5e1" }}>
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
                    backgroundColor: "#162032",
                    border: "1px solid #334155",
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
                <label style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
                        fontWeight: 700,
                        padding: "6px 14px",
                        borderRadius: "10px",
                        backgroundColor: linkPopup.currentUrl === slug ? "#2563eb" : "#1e293b",
                        color: linkPopup.currentUrl === slug ? "#ffffff" : "#cbd5e1",
                        border: "1px solid #334155",
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
                  style={{ width: "16px", height: "16px", accentColor: "#2563eb", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#cbd5e1" }}>
                  Open in New Tab (<code style={{ color: "#60a5fa", fontFamily: "monospace" }}>target="_blank"</code>)
                </span>
              </label>

              {/* Action Buttons */}
              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid #1e293b",
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
                    color: "#94a3b8",
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
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 900,
                    border: "none",
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

      {/* 🎨 Streamlined Auto Right-Click Context-Aware Customizer Modal */}
      {imagePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: "rgba(3, 7, 18, 0.82)",
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
              backgroundColor: "#0d1527",
              border: "1px solid #334155",
              borderRadius: "26px",
              padding: "24px",
              boxShadow: "0 30px 80px -20px rgba(0, 0, 0, 0.9)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              color: "#ffffff",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Context-Aware Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderBottom: "1px solid #1e293b", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "18px", boxShadow: "0 8px 16px -4px rgba(37,99,235,0.4)" }}>
                  {imagePopup.targetType === "logo" ? "🏷️" : imagePopup.targetType === "background" ? "🎨" : "🖼️"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 900, margin: 0, color: "#ffffff" }}>
                      {imagePopup.targetType === "logo" ? "Edit Logo & Branding" : imagePopup.targetType === "background" ? "Edit Section Background" : "Edit Image"}
                    </h3>
                    <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "9999px", backgroundColor: imagePopup.targetType === "logo" ? "#1e3a8a" : "#1e293b", color: imagePopup.targetType === "logo" ? "#60a5fa" : "#38bdf8", border: "1px solid #334155", textTransform: "uppercase" }}>
                      AUTO-{imagePopup.targetType}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0 0" }}>
                    Changes apply immediately & auto-save automatically ⚡
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImagePopup(null)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #334155", borderRadius: "10px", width: "32px", height: "32px", color: "#94a3b8", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ✕
              </button>
            </div>

            {/* Target Navigation Bar ("NAV TO THE LOGOS") - ONLY Shown for Logo Target */}
            {imagePopup.targetType === "logo" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#161e31", padding: "10px 14px", borderRadius: "14px", border: "1px solid #1e293b" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#cbd5e1", display: "flex", alignItems: "center", gap: "6px" }}>
                  🎯 Target Navigation:
                </span>
                <button
                  onClick={handleJumpToNavbarLogo}
                  style={{ backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "10px", padding: "6px 14px", fontSize: "11px", fontWeight: 900, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
                >
                  🚀 Jump / Nav to Navbar Logo
                </button>
              </div>
            )}

            {/* Streamlined Direct Inputs Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              {/* 1. File Upload from Device */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  {imagePopup.targetType === "logo" ? "Upload Logo Image File" : imagePopup.targetType === "background" ? "Upload Background Image File" : "Upload Image File from Device"}
                </label>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "44px", backgroundColor: "#1e293b", border: "1px dashed #38bdf8", borderRadius: "12px", color: "#38bdf8", fontSize: "13px", fontWeight: 800, cursor: "pointer", transition: "all 0.15s ease" }}>
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
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  {imagePopup.targetType === "logo" ? "Logo Image URL" : imagePopup.targetType === "background" ? "Background Image URL" : "Image URL"}
                </label>
                <input
                  type="text"
                  value={imagePopup.imageUrl}
                  onChange={(e) => handleUpdateAndSaveImage({ imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/your-image.jpg"
                  style={{ width: "100%", height: "42px", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* 3. Logo Specific Destination Link & Sync Toggle */}
              {imagePopup.targetType === "logo" && (
                <>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      Logo Navigation Destination (URL / Link)
                    </label>
                    <input
                      type="text"
                      value={imagePopup.linkUrl}
                      onChange={(e) => handleUpdateAndSaveImage({ linkUrl: e.target.value })}
                      placeholder="/home or https://yourcollege.edu.in"
                      style={{ width: "100%", height: "42px", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#161e31", padding: "10px 14px", borderRadius: "12px", border: "1px solid #1e293b", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={imagePopup.applyAllLogos}
                      onChange={(e) => handleUpdateAndSaveImage({ applyAllLogos: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "#2563eb", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>
                      ⚡ Apply logo change to ALL header navbars across site
                    </span>
                  </label>
                </>
              )}

              {/* 4. Section Background Specific Sync Toggle */}
              {imagePopup.targetType === "background" && (
                <label style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#161e31", padding: "10px 14px", borderRadius: "12px", border: "1px solid #1e293b", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={imagePopup.applyAllBackgrounds}
                    onChange={(e) => handleUpdateAndSaveImage({ applyAllBackgrounds: e.target.checked })}
                    style={{ width: "16px", height: "16px", accentColor: "#2563eb", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>
                    Apply background image to ALL sections on this page
                  </span>
                </label>
              )}

            </div>

            {/* Footer Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingTop: "14px", borderTop: "1px solid #1e293b" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#4ade80", display: "flex", alignItems: "center", gap: "6px" }}>
                ✓ Auto-Saved & Live Updated ⚡
              </span>
              <button
                onClick={() => setImagePopup(null)}
                style={{ height: "40px", padding: "0 22px", borderRadius: "12px", backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 900, border: "none", cursor: "pointer", fontSize: "13px", boxShadow: "0 8px 16px -4px rgba(37,99,235,0.4)" }}
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
