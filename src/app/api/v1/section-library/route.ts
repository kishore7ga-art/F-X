/**
 * A PREVIEW MOCK. Unreachable unless `NEXT_PUBLIC_UI_PREVIEW=1`.
 *
 * This file is a route, and **a filesystem route beats the `/api/v1/*` rewrite
 * in `next.config.ts`** — so without a guard it would not fall back to the
 * backend, it would replace it, for every tenant. The guard cannot live in this
 * handler: the route would still exist, the rewrite would still never run, and
 * returning 404 when a flag is off breaks the endpoint rather than proxying it.
 *
 * It lives in `next.config.ts` instead, which is where the precedence is
 * decided: with the flag off, this path is rewritten to the backend in
 * `beforeFiles`, ahead of filesystem routes, and everything below becomes
 * unreachable code. Read the comment on `rewrites()` before changing either.
 */
import { NextResponse } from "next/server";
import type { LibrarySection, SectionLibrary } from "@/lib/editor-api";

const TEMPLATES: LibrarySection[] = [
  {
    id: "tpl-facilities-1",
    name: "Campus Facilities & Infrastructure Grid",
    category: "facilities",
    description: "4-column modern card grid showcasing library, smart labs, sports arena, and student hostels.",
    thumbnailUrl: null,
    code: `<section style="background:#0f172a;padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:3.5rem;">
      <div style="display:inline-block;background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.2);padding:0.35rem 1rem;border-radius:999px;margin-bottom:1rem;">
        <span style="color:#60a5fa;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">World-Class Infrastructure</span>
      </div>
      <h2 style="color:#f8fafc;font-size:2.2rem;font-weight:900;letter-spacing:-0.03em;margin:0 0 0.75rem;">Campus Facilities</h2>
      <p style="color:#64748b;font-size:1rem;max-width:550px;margin:0 auto;">A vibrant 500-acre smart campus equipped with modern research labs, digital libraries, and athletic stadiums.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;">
      <div style="background:#1e293b;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;">
        <div style="width:48px;height:48px;background:rgba(37,99,235,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1.25rem;">📖</div>
        <h3 style="color:#f8fafc;font-size:1.15rem;font-weight:800;margin:0 0 0.5rem;">Digital Library</h3>
        <p style="color:#94a3b8;font-size:0.875rem;line-height:1.6;margin:0;">2M+ physical volumes, 50k+ e-journals, 24/7 quiet study zones, and high-speed Wi-Fi research pods.</p>
      </div>
      <div style="background:#1e293b;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;">
        <div style="width:48px;height:48px;background:rgba(168,85,247,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1.25rem;">🔬</div>
        <h3 style="color:#f8fafc;font-size:1.15rem;font-weight:800;margin:0 0 0.5rem;">Innovation & AI Labs</h3>
        <p style="color:#94a3b8;font-size:0.875rem;line-height:1.6;margin:0;">NVIDIA GPU superclusters, IoT robotics testbeds, and advanced prototyping maker spaces.</p>
      </div>
      <div style="background:#1e293b;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;">
        <div style="width:48px;height:48px;background:rgba(34,197,94,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1.25rem;">⚽</div>
        <h3 style="color:#f8fafc;font-size:1.15rem;font-weight:800;margin:0 0 0.5rem;">Olympic Sports Arena</h3>
        <p style="color:#94a3b8;font-size:0.875rem;line-height:1.6;margin:0;">Olympic-size swimming pool, FIFA-standard football turf, indoor basketball courts, and gymnasium.</p>
      </div>
      <div style="background:#1e293b;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;">
        <div style="width:48px;height:48px;background:rgba(245,158,11,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1.25rem;">🏢</div>
        <h3 style="color:#f8fafc;font-size:1.15rem;font-weight:800;margin:0 0 0.5rem;">Smart Residences</h3>
        <p style="color:#94a3b8;font-size:0.875rem;line-height:1.6;margin:0;">AC & Non-AC suites, 24/7 biometric security, multi-cuisine dining, and vibrant student lounges.</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "tpl-events-1",
    name: "Upcoming Campus Events & Fests",
    category: "events",
    description: "Event timeline showcasing technical symposiums, cultural fests, and hackathons.",
    thumbnailUrl: null,
    code: `<section style="background:#1e293b;padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:3rem;flex-wrap:wrap;gap:1rem;">
      <div>
        <div style="display:inline-block;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);padding:0.35rem 1rem;border-radius:999px;margin-bottom:0.875rem;">
          <span style="color:#c084fc;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Happening This Season</span>
        </div>
        <h2 style="color:#f8fafc;font-size:2.2rem;font-weight:900;letter-spacing:-0.03em;margin:0;">Upcoming Events & Fests</h2>
      </div>
      <a href="#" style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.25);color:#c084fc;padding:0.625rem 1.25rem;border-radius:8px;text-decoration:none;font-size:0.875rem;font-weight:600;">View Full Calendar →</a>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem;">
      <div style="background:#0f172a;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;display:flex;gap:1.5rem;align-items:flex-start;">
        <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);border-radius:12px;padding:0.75rem 1rem;text-align:center;color:#fff;min-width:60px;">
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;">OCT</div>
          <div style="font-size:1.6rem;font-weight:900;line-height:1;">18</div>
        </div>
        <div>
          <span style="background:rgba(37,99,235,0.15);color:#60a5fa;font-size:0.7rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:4px;">Hackathon</span>
          <h3 style="color:#f8fafc;font-size:1.1rem;font-weight:800;margin:0.5rem 0 0.25rem;">InnovateX 36-Hour Hackathon</h3>
          <p style="color:#94a3b8;font-size:0.85rem;margin:0;line-height:1.5;">₹10 Lakhs prize pool with mentors from Google & Microsoft. Over 500 teams competing.</p>
        </div>
      </div>
      <div style="background:#0f172a;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;display:flex;gap:1.5rem;align-items:flex-start;">
        <div style="background:linear-gradient(135deg,#e11d48,#be123c);border-radius:12px;padding:0.75rem 1rem;text-align:center;color:#fff;min-width:60px;">
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;">NOV</div>
          <div style="font-size:1.6rem;font-weight:900;line-height:1;">05</div>
        </div>
        <div>
          <span style="background:rgba(225,29,72,0.15);color:#fb7185;font-size:0.7rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:4px;">Cultural Fest</span>
          <h3 style="color:#f8fafc;font-size:1.1rem;font-weight:800;margin:0.5rem 0 0.25rem;">Riviera Annual Cultural Fest</h3>
          <p style="color:#94a3b8;font-size:0.85rem;margin:0;line-height:1.5;">3 days of music, dance, theatre and pro-nights featuring top national artists.</p>
        </div>
      </div>
      <div style="background:#0f172a;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;display:flex;gap:1.5rem;align-items:flex-start;">
        <div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;padding:0.75rem 1rem;text-align:center;color:#fff;min-width:60px;">
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;">DEC</div>
          <div style="font-size:1.6rem;font-weight:900;line-height:1;">12</div>
        </div>
        <div>
          <span style="background:rgba(245,158,11,0.15);color:#fbbf24;font-size:0.7rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:4px;">Conference</span>
          <h3 style="color:#f8fafc;font-size:1.1rem;font-weight:800;margin:0.5rem 0 0.25rem;">Global AI & Robotics Summit</h3>
          <p style="color:#94a3b8;font-size:0.85rem;margin:0;line-height:1.5;">Keynotes from IEEE fellows, paper presentations, and venture pitch day.</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "tpl-cta-1",
    name: "Admissions Call to Action Banner",
    category: "cta",
    description: "High-conversion CTA banner prompting prospective students to apply for upcoming admissions.",
    thumbnailUrl: null,
    code: `<section style="background:linear-gradient(135deg,#1d4ed8 0%,#1e1b4b 100%);padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;text-align:center;position:relative;overflow:hidden;">
  <div style="max-width:800px;margin:0 auto;position:relative;z-index:1;">
    <span style="background:rgba(255,255,255,0.15);color:#fff;font-size:0.8rem;font-weight:700;padding:0.35rem 1rem;border-radius:999px;display:inline-block;margin-bottom:1.25rem;letter-spacing:0.05em;text-transform:uppercase;">Admissions Open for 2025–26</span>
    <h2 style="color:#ffffff;font-size:clamp(2rem,4vw,3rem);font-weight:900;letter-spacing:-0.03em;margin:0 0 1rem;line-height:1.1;">Ready to Begin Your Journey at Greenfield?</h2>
    <p style="color:#bfdbfe;font-size:1.1rem;margin:0 0 2rem;line-height:1.6;">Apply online in under 10 minutes. Early decision applications receive priority merit scholarships.</p>
    <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
      <a href="#" style="background:#ffffff;color:#1e40af;padding:0.875rem 2rem;border-radius:10px;text-decoration:none;font-size:1rem;font-weight:800;box-shadow:0 8px 20px rgba(0,0,0,0.25);">Apply Online Now →</a>
      <a href="#" style="border:1.5px solid rgba(255,255,255,0.4);color:#ffffff;padding:0.875rem 2rem;border-radius:10px;text-decoration:none;font-size:1rem;font-weight:700;">Download Brochure</a>
    </div>
  </div>
</section>`,
  },
  {
    id: "tpl-vision-1",
    name: "Vision & Mission Statement",
    category: "vision",
    description: "Two-card layout highlighting the institutional vision, mission, and core academic values.",
    thumbnailUrl: null,
    code: `<section style="background:#0f172a;padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:3.5rem;">
      <h2 style="color:#f8fafc;font-size:2.2rem;font-weight:900;letter-spacing:-0.03em;margin:0 0 0.75rem;">Vision &amp; Mission</h2>
      <p style="color:#64748b;font-size:1rem;">Guided by principles of integrity, innovation, and global impact.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;">
      <div style="background:#1e293b;border:1px solid rgba(37,99,235,0.2);border-radius:20px;padding:2.5rem;">
        <div style="width:52px;height:52px;background:rgba(37,99,235,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin-bottom:1.5rem;">🎯</div>
        <h3 style="color:#f8fafc;font-size:1.4rem;font-weight:800;margin:0 0 1rem;letter-spacing:-0.02em;">Our Vision</h3>
        <p style="color:#94a3b8;font-size:1rem;line-height:1.75;margin:0;">To be recognized globally as a premier center of higher education and pioneering research, creating visionary leaders who transform society through knowledge, ethics, and innovation.</p>
      </div>
      <div style="background:#1e293b;border:1px solid rgba(168,85,247,0.2);border-radius:20px;padding:2.5rem;">
        <div style="width:52px;height:52px;background:rgba(168,85,247,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin-bottom:1.5rem;">🚀</div>
        <h3 style="color:#f8fafc;font-size:1.4rem;font-weight:800;margin:0 0 1rem;letter-spacing:-0.02em;">Our Mission</h3>
        <p style="color:#94a3b8;font-size:1rem;line-height:1.75;margin:0;">To provide transformative experiential education, foster multidisciplinary research addressing real-world challenges, and cultivate an inclusive campus that champions intellectual curiosity.</p>
      </div>
    </div>
  </div>
</section>`,
  },
];

const BY_CATEGORY: Record<string, LibrarySection[]> = {};
for (const item of TEMPLATES) {
  if (!BY_CATEGORY[item.category]) BY_CATEGORY[item.category] = [];
  BY_CATEGORY[item.category].push(item);
}

export async function GET() {
  const library: SectionLibrary = {
    sections: TEMPLATES,
    byCategory: BY_CATEGORY,
  };
  return NextResponse.json(library);
}
