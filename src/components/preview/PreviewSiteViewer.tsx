"use client";

import { useEffect, useState } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";

interface SectionItem {
  id: string;
  title: string;
  code: string;
}

const DEFAULT_CLEAN_FULL_SECTIONS: SectionItem[] = [
  {
    id: "nav",
    title: "Navbar / Header",
    code: `<header style="background: #0d1527; color: #ffffff; padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-bottom: 1px solid rgba(255,255,255,0.1); position: relative;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 40px; height: 40px; border-radius: 10px; background: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px;">🎓</div>
      <span style="font-size: 20px; font-weight: 900; color: #ffffff; white-space: nowrap;">GREENFIELD UNIVERSITY</span>
    </div>
    <nav class="desktop-nav-links" style="display: flex; gap: 24px; font-size: 14px; font-weight: 700;">
      <a href="#about" style="color: #cbd5e1; text-decoration: none; white-space: nowrap;">About</a>
      <a href="#courses" style="color: #cbd5e1; text-decoration: none; white-space: nowrap;">Academics</a>
      <a href="#admissions" style="color: #cbd5e1; text-decoration: none; white-space: nowrap;">Admissions</a>
      <a href="#placements" style="color: #cbd5e1; text-decoration: none; white-space: nowrap;">Placements</a>
      <a href="#contact" style="color: #cbd5e1; text-decoration: none; white-space: nowrap;">Contact</a>
    </nav>
    <a href="#apply" class="desktop-apply-btn" style="background: #2563eb; color: #ffffff; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 800; text-decoration: none; white-space: nowrap;">Apply Now</a>
    <button class="hamburger-toggle-btn" style="display: none; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #ffffff; padding: 8px 14px; border-radius: 8px; font-size: 20px; cursor: pointer; align-items: center; justify-content: center;" aria-label="Toggle Navigation Menu">
      ☰
    </button>
  </header>`,
  },
  {
    id: "hero",
    title: "Hero Banner",
    code: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px 60px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-bottom: 1px solid #e2e8f0;">
    <div style="max-width: 960px; margin: 0 auto;">
      <span style="background: #ffe4e6; border: 1px solid #f43f5e; color: #e11d48; padding: 6px 20px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">ADMISSIONS OPEN 2026–2027</span>
      <h1 style="font-size: 56px; font-weight: 900; margin-top: 24px; line-height: 1.15; color: #0f172a; letter-spacing: -0.02em;">Empowering Minds, Shaping Tomorrow's Leaders</h1>
      <p style="font-size: 18px; color: #64748b; margin-top: 20px; line-height: 1.6; max-width: 840px; margin-left: auto; margin-right: auto; font-weight: 500;">Join a world-class academic community dedicated to innovation, groundbreaking research, and personal growth. Discover over 120 undergraduate and graduate programs tailored for your future.</p>
      <div style="margin-top: 36px; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
        <a href="#admissions" style="background: #ef4444; color: #ffffff; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4); display: inline-block;">Apply Now</a>
        <a href="#courses" style="background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; display: inline-block;">Explore Programs</a>
      </div>
      <div style="margin-top: 60px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; border-top: 1px solid #e2e8f0; padding-top: 32px;">
        <div><div style="font-size: 28px; font-weight: 900; color: #0f172a;">#12</div><div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px;">NATIONAL RANK</div></div>
        <div><div style="font-size: 28px; font-weight: 900; color: #0f172a;">120+</div><div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px;">ACADEMIC MAJORS</div></div>
        <div><div style="font-size: 28px; font-weight: 900; color: #0f172a;">96%</div><div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px;">GRADUATE PLACEMENT</div></div>
        <div><div style="font-size: 28px; font-weight: 900; color: #0f172a;">10:1</div><div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px;">STUDENT-FACULTY RATIO</div></div>
      </div>
    </div>
  </section>`,
  },
  {
    id: "highlights",
    title: "College Highlights",
    code: `<section style="background: #0f172a; color: #ffffff; padding: 60px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center;">
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">#15</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">NIRF National Rank</p></div>
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">98.4%</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Placement Record</p></div>
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">500+</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Top Recruiters</p></div>
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">15,000+</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Active Students</p></div>
    </div>
  </section>`,
  },
  {
    id: "about",
    title: "About College",
    code: `<section id="about" style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 48px; align-items: center;">
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
  },
  {
    id: "vision",
    title: "Vision & Mission",
    code: `<section style="background: #f8fafc; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
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
  },
  {
    id: "courses",
    title: "Courses / Programs Offered",
    code: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
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
  },
  {
    id: "departments",
    title: "Departments",
    code: `<section style="background: #f1f5f9; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto;">
      <h2 style="font-size: 32px; font-weight: 900; text-align: center;">Academic Departments</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h4 style="font-size: 16px; font-weight: 900;">School of Engineering</h4><p style="font-size: 13px; color: #64748b; margin-top: 6px;">CSE, ECE, Mechanical, Civil & AI Labs</p></div>
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h4 style="font-size: 16px; font-weight: 900;">School of Management</h4><p style="font-size: 13px; color: #64748b; margin-top: 6px;">MBA, BBA, Finance & HR Specializations</p></div>
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h4 style="font-size: 16px; font-weight: 900;">School of Basic Sciences</h4><p style="font-size: 13px; color: #64748b; margin-top: 6px;">Physics, Chemistry & Applied Mathematics</p></div>
      </div>
    </div>
  </section>`,
  },
  {
    id: "admissions",
    title: "Admission Section",
    code: `<section style="background: #0f172a; color: #ffffff; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
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
  },
  {
    id: "placements",
    title: "Placement & Recruiters",
    code: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 36px; font-weight: 900;">Placement & Top Recruiters</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 36px;">
        <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h3 style="font-size: 32px; font-weight: 900; color: #2563eb; margin: 0;">₹52 LPA</h3><p style="font-size: 13px; color: #64748b; font-weight: 700;">Highest National Package</p></div>
        <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h3 style="font-size: 32px; font-weight: 900; color: #2563eb; margin: 0;">₹12.4 LPA</h3><p style="font-size: 13px; color: #64748b; font-weight: 700;">Average Campus Salary</p></div>
        <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;"><h3 style="font-size: 32px; font-weight: 900; color: #2563eb; margin: 0;">450+</h3><p style="font-size: 13px; color: #64748b; font-weight: 700;">Recruiting Partners</p></div>
      </div>
    </div>
  </section>`,
  },
  {
    id: "facilities",
    title: "Campus Facilities",
    code: `<section style="background: #f8fafc; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
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
  },
  {
    id: "research",
    title: "Research & Innovation",
    code: `<section style="background: #0d1527; color: #ffffff; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
      <span style="color: #38bdf8; font-size: 12px; font-weight: 900; text-transform: uppercase;">PATENTS & R&D</span>
      <h2 style="font-size: 36px; font-weight: 900; margin-top: 10px;">Pioneering Research & Innovation Labs</h2>
      <p style="font-size: 15px; color: #94a3b8; margin-top: 14px; max-width: 700px; margin-left: auto; margin-right: auto;">Over 120+ published research papers and 35 national patents filed in AI, Robotics, Renewable Energy & Semiconductor Design.</p>
    </div>
  </section>`,
  },
  {
    id: "news",
    title: "News & Announcements",
    code: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto;">
      <h2 style="font-size: 32px; font-weight: 900; text-align: center;">News & Official Circulars</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 36px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px;"><span style="font-size: 11px; font-weight: 800; color: #2563eb;">AUG 10, 2026</span><h4 style="font-size: 15px; font-weight: 900; margin-top: 6px;">End-Semester Examination Schedule Released</h4></div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px;"><span style="font-size: 11px; font-weight: 800; color: #2563eb;">AUG 15, 2026</span><h4 style="font-size: 15px; font-weight: 900; margin-top: 6px;">79th Independence Day Celebration Convocation</h4></div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px;"><span style="font-size: 11px; font-weight: 800; color: #2563eb;">SEP 01, 2026</span><h4 style="font-size: 15px; font-weight: 900; margin-top: 6px;">International Student Exchange Orientation</h4></div>
      </div>
    </div>
  </section>`,
  },
  {
    id: "events",
    title: "Upcoming Events",
    code: `<section style="background: #f1f5f9; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto;">
      <h2 style="font-size: 32px; font-weight: 900; text-align: center;">Upcoming Campus Events</h2>
      <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 36px;">
        <div style="background: #ffffff; padding: 20px 28px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;"><div style="display: flex; align-items: center; gap: 20px;"><div style="background: #0f172a; color: #ffffff; padding: 10px 16px; border-radius: 12px; font-weight: 900; text-align: center;"><span style="font-size: 18px; display: block;">24</span><span style="font-size: 11px;">AUG</span></div><div><h4 style="font-size: 16px; font-weight: 900; margin: 0;">Global Tech Hackathon 2026</h4><p style="font-size: 13px; color: #64748b; margin-top: 4px;">48-Hour Inter-College Coding Competition</p></div></div><a href="#register" style="background: #2563eb; color: #ffffff; padding: 8px 20px; border-radius: 10px; font-size: 12px; font-weight: 800; text-decoration: none;">Register Now</a></div>
      </div>
    </div>
  </section>`,
  },
  {
    id: "gallery",
    title: "Gallery / Campus Life",
    code: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 32px; font-weight: 900;">Vibrant Campus Life & Infrastructure</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 36px;">
        <div style="height: 200px; background: #e2e8f0; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #64748b;">Central Auditorium</div>
        <div style="height: 200px; background: #cbd5e1; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #334155;">Sports Arena</div>
        <div style="height: 200px; background: #94a3b8; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #ffffff;">Robotics Research Lab</div>
      </div>
    </div>
  </section>`,
  },
  {
    id: "testimonials",
    title: "Student Testimonials",
    code: `<section style="background: #0f172a; color: #ffffff; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 32px; font-weight: 900;">What Our Students & Alumni Say</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 36px; text-align: left;">
        <div style="background: #1e293b; padding: 28px; border-radius: 20px; border: 1px solid #334155;"><p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">"The hands-on coding labs and mentor support at Greenfield helped me secure a Software Engineer role at Google."</p><span style="font-size: 13px; font-weight: 900; color: #38bdf8; display: block; margin-top: 16px;">— Rahul Sharma (B.Tech CSE '25)</span></div>
        <div style="background: #1e293b; padding: 28px; border-radius: 20px; border: 1px solid #334155;"><p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">"World-class faculty, vibrant campus events, and incredible placement opportunities made my university years unforgettable."</p><span style="font-size: 13px; font-weight: 900; color: #38bdf8; display: block; margin-top: 16px;">— Priya Sundaram (MBA '24)</span></div>
      </div>
    </div>
  </section>`,
  },
  {
    id: "achievements",
    title: "Achievements & Awards",
    code: `<section style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 32px; font-weight: 900;">Awards & Recognitions</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 36px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px;"><div style="font-size: 28px;">🏆</div><h4 style="font-size: 16px; font-weight: 900; margin-top: 8px;">Best Green Campus Award 2025</h4></div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px;"><div style="font-size: 28px;">🎖️</div><h4 style="font-size: 16px; font-weight: 900; margin-top: 8px;">Top 10 Private Engineering University</h4></div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px;"><div style="font-size: 28px;">🌟</div><h4 style="font-size: 16px; font-weight: 900; margin-top: 8px;">National Patent Excellence Citation</h4></div>
      </div>
    </div>
  </section>`,
  },
  {
    id: "contact",
    title: "Contact / Enquiry Form",
    code: `<section style="background: #f8fafc; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
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
  },
  {
    id: "map",
    title: "Map & Location",
    code: `<section style="background: #0f172a; color: #ffffff; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 32px; font-weight: 900;">Campus Location & Directions</h2>
      <p style="font-size: 14px; color: #94a3b8; margin-top: 8px;">Greenfield Campus, Knowledge Park III, Tech City - 600001</p>
      <div style="width: 100%; height: 260px; background: #1e293b; border-radius: 20px; border: 1px solid #334155; margin-top: 28px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #38bdf8;">📍 Interactive Google Map View</div>
    </div>
  </section>`,
  },
  {
    id: "footer",
    title: "Footer",
    code: `<footer style="background: #090d16; color: #94a3b8; padding: 40px 40px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-top: 1px solid #1e293b; text-align: center;">
    <p style="font-size: 13px; font-weight: 700; color: #cbd5e1; margin: 0;">© 2026 Greenfield University. All Rights Reserved.</p>
    <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Approved by AICTE, UGC & Accredited by NAAC A++ Grade.</p>
  </footer>`,
  },
];

export function PreviewSiteViewer({ subdomain }: { subdomain: string }) {
  const [sections, setSections] = useState<SectionItem[]>(DEFAULT_CLEAN_FULL_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [previewWidth, setPreviewWidth] = useState<string>("100%");

  useEffect(() => {
    let cancelled = false;

    // 1. Load exact live sections edited in Editor Studio from localStorage
    if (typeof window !== "undefined") {
      try {
        const savedActive = localStorage.getItem(`xite_active_sections_${subdomain}`);
        if (savedActive && savedActive !== "undefined" && savedActive !== "null") {
          const parsed = JSON.parse(savedActive);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSections(parsed);
            setLoading(false);
            return;
          }
        }

        const savedPages = localStorage.getItem("xite_saved_pages");
        if (savedPages && savedPages !== "undefined" && savedPages !== "null") {
          const parsedPages = JSON.parse(savedPages);
          const homeSecs = parsedPages["/home"] || parsedPages["/"] || Object.values(parsedPages)[0];
          if (Array.isArray(homeSecs) && homeSecs.length > 0) {
            setSections(homeSecs);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not read localStorage sections for live preview:", err);
      }
    }

    // 2. Fallback to backend API if localStorage is empty
    const fetchSiteSections = async () => {
      try {
        const hostname = typeof window !== "undefined" ? window.location.hostname : "";
        const apiBase = hostname === "localhost" || hostname === "127.0.0.1" ? "http://localhost:4000" : "https://api.xite.co.in";
        const res = await fetch(`${apiBase}/api/v1/default-website`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const pageSecs =
            Array.isArray(data.sections) && data.sections.length > 0
              ? data.sections
              : Array.isArray(data.pages) && data.pages[0] && Array.isArray(data.pages[0].sections)
              ? data.pages[0].sections
              : [];
          if (pageSecs.length > 0) {
            if (!cancelled) {
              setSections(
                pageSecs.map((sec: any, idx: number) => ({
                  id: sec.id || `sec-${idx}`,
                  title: sec.title || `Section ${idx + 1}`,
                  code: sec.code || "",
                }))
              );
            }
          }
        }
      } catch (err) {
        console.warn("Could not load backend published site sections:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchSiteSections();
    const interval = setInterval(() => {
      void fetchSiteSections();
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [subdomain]);

  if (loading && sections.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading published website preview...</p>
        </div>
      </div>
    );
  }

  const cleanFullWebCodeForCanvas = (code: string, currentWidth: string): string => {
    if (!code) return "";

    const isResponsiveView = currentWidth === "768px" || currentWidth === "375px" || currentWidth === "425px" || currentWidth === "640px";

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

      /* Universal Header Containment */
      header, .section-canvas-box header {
        max-width: 100% !important;
        width: 100% !important;
        box-sizing: border-box !important;
        position: relative !important;
        margin-top: 0 !important;
        top: 0 !important;
      }

      ${isResponsiveView ? `
        /* Forced Tablet & Mobile Rules when responsive viewport selected */
        header nav:not(.mobile-drawer-menu nav),
        header .desktop-nav-links,
        header ul:not(.mobile-drawer-menu ul),
        header a[style*="background"]:not(.mobile-drawer-menu a),
        header .desktop-apply-btn {
          display: none !important;
        }
        header .hamburger-toggle-btn {
          display: flex !important;
        }
        header .mobile-drawer-menu.active {
          display: block !important;
        }
      ` : `
        /* Mobile & Tablet Viewport Rules (<= 900px: Phone 375px & Tablet 768px) */
        @media (max-width: 900px) {
          header nav:not(.mobile-drawer-menu nav),
          header .desktop-nav-links,
          header ul:not(.mobile-drawer-menu ul),
          header a[style*="background"]:not(.mobile-drawer-menu a),
          header .desktop-apply-btn {
            display: none !important;
          }
          header .hamburger-toggle-btn {
            display: flex !important;
          }
          header .mobile-drawer-menu.active {
            display: block !important;
          }
        }

        /* Desktop Viewport Rules (> 900px) */
        @media (min-width: 901px) {
          header .hamburger-toggle-btn,
          header .mobile-drawer-menu {
            display: none !important;
          }
          header nav, header .desktop-nav-links, header ul {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: clamp(4px, 1.2vw, 16px) !important;
            min-width: 0 !important;
          }
          header nav a, header .desktop-nav-links a, header ul a {
            white-space: nowrap !important;
            font-size: clamp(11px, 1.05vw, 14px) !important;
            line-height: 1.2 !important;
          }
          header a[style*="background"], header button[style*="background"], header .desktop-apply-btn {
            display: inline-block !important;
            flex-shrink: 0 !important;
            white-space: nowrap !important;
          }
        }
      `}
    </style>`;

    return `${containmentStyles}<div class="section-canvas-box">${cleanCode}</div>`;
  };

  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const search = window.location.search;
      if (
        pathname.startsWith("/site") ||
        search.includes("live=true") ||
        search.includes("mode=live")
      ) {
        setIsLive(true);
      }
    }
  }, []);

  const DESKTOP_WIDTHS = ["100%", "1200px", "1024px"];
  const TABLET_WIDTHS = ["768px", "640px"];
  const MOBILE_WIDTHS = ["375px", "425px"];

  const isDesktop = DESKTOP_WIDTHS.includes(previewWidth);
  const isTablet = TABLET_WIDTHS.includes(previewWidth);
  const isMobile = MOBILE_WIDTHS.includes(previewWidth);

  const handleDesktopClick = () => {
    if (isDesktop) {
      const nextIdx = (DESKTOP_WIDTHS.indexOf(previewWidth) + 1) % DESKTOP_WIDTHS.length;
      setPreviewWidth(DESKTOP_WIDTHS[nextIdx]!);
    } else {
      setPreviewWidth("100%");
    }
  };

  const handleTabletClick = () => {
    if (isTablet) {
      const nextIdx = (TABLET_WIDTHS.indexOf(previewWidth) + 1) % TABLET_WIDTHS.length;
      setPreviewWidth(TABLET_WIDTHS[nextIdx]!);
    } else {
      setPreviewWidth("768px");
    }
  };

  const handleMobileClick = () => {
    if (isMobile) {
      const nextIdx = (MOBILE_WIDTHS.indexOf(previewWidth) + 1) % MOBILE_WIDTHS.length;
      setPreviewWidth(MOBILE_WIDTHS[nextIdx]!);
    } else {
      setPreviewWidth("375px");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-sans relative">
      
      {/* Responsive Device Resolution Switcher Dock - Centered at bottom (Hidden in Live Mode) */}
      {!isLive && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
          }}
          className="bg-white/95 backdrop-blur-xl border border-slate-200/90 p-1.5 px-3 rounded-full shadow-[0_16px_40px_rgba(15,23,42,0.14),0_4px_12px_rgba(0,0,0,0.06)] flex items-center justify-center gap-1.5 select-none transition-all duration-200"
        >
          {/* Vertical Divider Line */}
          <div className="h-4.5 w-[1px] bg-slate-200 shrink-0 mx-0.5" />

          {/* 1. Desktop Button */}
          <button
            type="button"
            onClick={handleDesktopClick}
            className={`flex items-center gap-2 h-9 transition-all duration-200 cursor-pointer rounded-full text-xs ${
              isDesktop
                ? "bg-white border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.08),0_1px_2px_rgba(0,0,0,0.04)] px-3.5 text-slate-900 font-extrabold"
                : "bg-transparent border border-transparent px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
            }`}
            title="Desktop Resolution (Click to Cycle 100% / 1200px / 1024px)"
          >
            <Monitor className={`w-4.5 h-4.5 shrink-0 ${isDesktop ? "text-slate-900" : "text-slate-500"}`} />
            {isDesktop && (
              <span className="font-mono font-extrabold text-[12.5px] text-slate-900 tracking-tight">
                {previewWidth}
              </span>
            )}
          </button>

          {/* 2. Tablet Button */}
          <button
            type="button"
            onClick={handleTabletClick}
            className={`flex items-center gap-2 h-9 transition-all duration-200 cursor-pointer rounded-full text-xs ${
              isTablet
                ? "bg-white border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.08),0_1px_2px_rgba(0,0,0,0.04)] px-3.5 text-slate-900 font-extrabold"
                : "bg-transparent border border-transparent px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
            }`}
            title="Tablet Resolution (Click to Cycle 768px / 640px)"
          >
            <Tablet className={`w-4.5 h-4.5 shrink-0 ${isTablet ? "text-slate-900" : "text-slate-500"}`} />
            {isTablet && (
              <span className="font-mono font-extrabold text-[12.5px] text-slate-900 tracking-tight">
                {previewWidth}
              </span>
            )}
          </button>

          {/* 3. Mobile Button */}
          <button
            type="button"
            onClick={handleMobileClick}
            className={`flex items-center gap-2 h-9 transition-all duration-200 cursor-pointer rounded-full text-xs ${
              isMobile
                ? "bg-white border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.08),0_1px_2px_rgba(0,0,0,0.04)] px-3.5 text-slate-900 font-extrabold"
                : "bg-transparent border border-transparent px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
            }`}
            title="Mobile Phone Resolution (Click to Cycle 375px / 425px)"
          >
            <Smartphone className={`w-4.5 h-4.5 shrink-0 ${isMobile ? "text-slate-900" : "text-slate-500"}`} />
            {isMobile && (
              <span className="font-mono font-extrabold text-[12.5px] text-slate-900 tracking-tight">
                {previewWidth}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Live Site View */}
      <main className={`w-full flex-1 flex flex-col items-center justify-start transition-all ${
        previewWidth === "100%" ? "p-0 m-0 bg-white pb-36" : "py-12 px-4 bg-slate-100/90 pb-36"
      }`}>
        <div
          className={`transition-all duration-300 flex flex-col items-center justify-start mx-auto bg-white overflow-hidden max-w-full ${
            previewWidth === "100%"
              ? "w-full min-h-screen rounded-none border-none shadow-none m-0 p-0"
              : "min-h-[75vh] shadow-2xl rounded-2xl border border-slate-300 my-4"
          }`}
          style={{ width: previewWidth, maxWidth: "100%" }}
        >
          {sections.map((sec) => (
            <div
              key={sec.id}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target) {
                  const hamburgerBtn = target.closest("button.hamburger-toggle-btn, button.hamburger, [data-mobile-menu], .mobile-menu-btn, .hamburger, header button, header svg") as HTMLElement;
                  if (hamburgerBtn) {
                    const headerElem = hamburgerBtn.closest("header") || target.closest("header");
                    if (headerElem) {
                      let drawer = headerElem.querySelector(".mobile-drawer-menu, nav.mobile-menu, nav:not(.desktop-nav-links)") as HTMLElement;
                      if (!drawer) {
                        drawer = document.createElement("div");
                        drawer.className = "mobile-drawer-menu active";
                        drawer.style.cssText = "display: block !important; width: 100%; background: #0b1120; border-top: 1px solid rgba(255,255,255,0.1); padding: 16px 20px; margin-top: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); position: relative; z-index: 99;";
                        drawer.innerHTML = `
                          <nav style="display: flex; flex-direction: column; gap: 8px; font-size: 15px; font-weight: 700;">
                            <a href="#home" style="color: #ffffff; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Home</a>
                            <a href="#about" style="color: #cbd5e1; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">About Us</a>
                            <a href="#courses" style="color: #cbd5e1; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Academics & Courses</a>
                            <a href="#admissions" style="color: #cbd5e1; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Admissions</a>
                            <a href="#placements" style="color: #cbd5e1; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Placements & Careers</a>
                            <a href="#contact" style="color: #cbd5e1; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Contact Helpdesk</a>
                          </nav>
                        `;
                        headerElem.appendChild(drawer);
                      } else {
                        drawer.classList.toggle("active");
                        if (drawer.style.display === "none" || !drawer.classList.contains("active")) {
                          drawer.style.display = "none";
                        } else {
                          drawer.style.display = "block";
                        }
                      }
                    }
                  }
                }
              }}
              dangerouslySetInnerHTML={{ __html: cleanFullWebCodeForCanvas(sec.code, previewWidth) }}
              className="w-full overflow-hidden"
            />
          ))}
          <div className="w-full h-36 bg-transparent pointer-events-none shrink-0" />
        </div>
      </main>
    </div>
  );
}
