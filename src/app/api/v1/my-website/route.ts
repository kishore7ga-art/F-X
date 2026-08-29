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
import type { NextRequest } from "next/server";

// ─── In-memory store so edits persist within the same server session ──────────
// (resets on server restart, but gives proper save/update feedback in the UI)

const store: Record<string, unknown> = {};

// ─── Demo sections ────────────────────────────────────────────────────────────

const NAVBAR = {
  id: "sec-navbar-1",
  title: "Navbar",
  category: "navbar",
  templateId: null,
  variantIndex: 0,
  code: `<header style="background:#0d1527;padding:0 2.5rem;display:flex;align-items:center;justify-content:space-between;height:68px;font-family:'Inter',system-ui,sans-serif;position:sticky;top:0;z-index:50;border-bottom:1px solid rgba(148,163,184,0.08);">
  <a href="/" style="display:flex;align-items:center;gap:0.75rem;text-decoration:none;">
    <div style="width:38px;height:38px;background:linear-gradient(135deg,#2563eb,#1d4ed8);border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(37,99,235,0.4);">
      <span style="color:#fff;font-weight:900;font-size:1.1rem;letter-spacing:-0.05em;">G</span>
    </div>
    <div>
      <div style="color:#f8fafc;font-weight:800;font-size:1rem;letter-spacing:-0.02em;line-height:1.1;">Greenfield University</div>
      <div style="color:#60a5fa;font-size:0.65rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Est. 1964 · NAAC A++</div>
    </div>
  </a>
  <nav style="display:flex;align-items:center;gap:0.25rem;">
    <a href="#" style="color:#94a3b8;text-decoration:none;font-size:0.875rem;font-weight:500;padding:0.5rem 0.875rem;border-radius:6px;transition:all 0.15s;" onmouseover="this.style.color='#f8fafc';this.style.background='rgba(148,163,184,0.08)'" onmouseout="this.style.color='#94a3b8';this.style.background='transparent'">About</a>
    <a href="#" style="color:#94a3b8;text-decoration:none;font-size:0.875rem;font-weight:500;padding:0.5rem 0.875rem;border-radius:6px;">Courses</a>
    <a href="#" style="color:#94a3b8;text-decoration:none;font-size:0.875rem;font-weight:500;padding:0.5rem 0.875rem;border-radius:6px;">Research</a>
    <a href="#" style="color:#94a3b8;text-decoration:none;font-size:0.875rem;font-weight:500;padding:0.5rem 0.875rem;border-radius:6px;">Placements</a>
    <a href="#" style="color:#94a3b8;text-decoration:none;font-size:0.875rem;font-weight:500;padding:0.5rem 0.875rem;border-radius:6px;">Contact</a>
  </nav>
  <div style="display:flex;align-items:center;gap:0.75rem;">
    <a href="#" style="color:#60a5fa;text-decoration:none;font-size:0.875rem;font-weight:600;padding:0.5rem 1rem;border-radius:6px;border:1.5px solid rgba(96,165,250,0.3);">Login</a>
    <a href="#" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:0.5rem 1.25rem;border-radius:8px;text-decoration:none;font-size:0.875rem;font-weight:700;box-shadow:0 4px 12px rgba(37,99,235,0.35);">Apply Now →</a>
  </div>
</header>`,
};

const HERO = {
  id: "sec-hero-1",
  title: "Hero Banner",
  category: "hero",
  templateId: null,
  variantIndex: 0,
  code: `<section style="background:linear-gradient(160deg,#0a0f1e 0%,#0f172a 45%,#0d1f3c 100%);padding:5rem 2.5rem 6rem;font-family:'Inter',system-ui,sans-serif;position:relative;overflow:hidden;min-height:560px;display:flex;align-items:center;">
  <!-- Background glow orbs -->
  <div style="position:absolute;top:-80px;right:-80px;width:500px;height:500px;background:radial-gradient(circle,rgba(37,99,235,0.18) 0%,transparent 70%);pointer-events:none;"></div>
  <div style="position:absolute;bottom:-100px;left:-60px;width:400px;height:400px;background:radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%);pointer-events:none;"></div>

  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 420px;gap:4rem;align-items:center;position:relative;z-index:1;">
    <div>
      <div style="display:inline-flex;align-items:center;gap:0.5rem;background:rgba(37,99,235,0.12);border:1px solid rgba(37,99,235,0.25);padding:0.4rem 1rem;border-radius:999px;margin-bottom:1.5rem;">
        <span style="width:7px;height:7px;background:#2563eb;border-radius:50%;display:inline-block;animation:pulse 2s infinite;"></span>
        <span style="color:#60a5fa;font-size:0.78rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">NAAC A++ · NIRF Rank #42</span>
      </div>
      <h1 style="color:#f8fafc;font-size:clamp(2.2rem,4.5vw,3.6rem);font-weight:900;line-height:1.08;letter-spacing:-0.04em;margin:0 0 1.25rem;">
        Shape Tomorrow's<br/>
        <span style="background:linear-gradient(135deg,#3b82f6,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Leaders &amp; Innovators</span>
      </h1>
      <p style="color:#94a3b8;font-size:1.1rem;line-height:1.75;margin:0 0 2rem;max-width:500px;">
        Join 25,000+ students at Greenfield University — a research-driven institution with 80+ programmes, world-class faculty, and a 95% placement record.
      </p>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;">
        <a href="#" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:0.875rem 2rem;border-radius:10px;text-decoration:none;font-size:1rem;font-weight:700;box-shadow:0 8px 24px rgba(37,99,235,0.4);letter-spacing:-0.01em;">Explore Programmes →</a>
        <a href="#" style="color:#f8fafc;text-decoration:none;font-size:0.95rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;padding:0.875rem 1.5rem;border-radius:10px;border:1.5px solid rgba(148,163,184,0.2);">
          <span style="width:36px;height:36px;background:rgba(37,99,235,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">▶</span>
          Virtual Campus Tour
        </a>
      </div>
      <div style="display:flex;gap:2rem;margin-top:2.5rem;padding-top:2rem;border-top:1px solid rgba(148,163,184,0.1);">
        <div><div style="color:#f8fafc;font-size:1.6rem;font-weight:900;letter-spacing:-0.03em;">25K+</div><div style="color:#64748b;font-size:0.8rem;margin-top:2px;">Students</div></div>
        <div><div style="color:#f8fafc;font-size:1.6rem;font-weight:900;letter-spacing:-0.03em;">800+</div><div style="color:#64748b;font-size:0.8rem;margin-top:2px;">Faculty</div></div>
        <div><div style="color:#f8fafc;font-size:1.6rem;font-weight:900;letter-spacing:-0.03em;">95%</div><div style="color:#64748b;font-size:0.8rem;margin-top:2px;">Placement</div></div>
        <div><div style="color:#f8fafc;font-size:1.6rem;font-weight:900;letter-spacing:-0.03em;">60+</div><div style="color:#64748b;font-size:0.8rem;margin-top:2px;">Years</div></div>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(148,163,184,0.1);border-radius:20px;padding:2rem;backdrop-filter:blur(8px);">
      <div style="font-size:0.75rem;color:#60a5fa;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:1rem;">Quick Apply 2025–26</div>
      <div style="display:flex;flex-direction:column;gap:0.875rem;">
        <input placeholder="Full Name" style="background:rgba(255,255,255,0.06);border:1px solid rgba(148,163,184,0.15);border-radius:8px;padding:0.75rem 1rem;color:#f8fafc;font-size:0.9rem;outline:none;font-family:inherit;width:100%;box-sizing:border-box;" />
        <input placeholder="Email Address" style="background:rgba(255,255,255,0.06);border:1px solid rgba(148,163,184,0.15);border-radius:8px;padding:0.75rem 1rem;color:#f8fafc;font-size:0.9rem;outline:none;font-family:inherit;width:100%;box-sizing:border-box;" />
        <input placeholder="Phone Number" style="background:rgba(255,255,255,0.06);border:1px solid rgba(148,163,184,0.15);border-radius:8px;padding:0.75rem 1rem;color:#f8fafc;font-size:0.9rem;outline:none;font-family:inherit;width:100%;box-sizing:border-box;" />
        <select style="background:rgba(255,255,255,0.06);border:1px solid rgba(148,163,184,0.15);border-radius:8px;padding:0.75rem 1rem;color:#94a3b8;font-size:0.9rem;outline:none;font-family:inherit;width:100%;">
          <option>Select Programme</option>
          <option>B.Tech Computer Science</option>
          <option>B.Tech Electronics</option>
          <option>MBA Business Administration</option>
          <option>M.Tech AI &amp; ML</option>
          <option>Ph.D Research</option>
        </select>
        <button style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:0.875rem;border-radius:8px;border:none;font-size:0.95rem;font-weight:700;cursor:pointer;width:100%;font-family:inherit;box-shadow:0 4px 14px rgba(37,99,235,0.4);">Submit Application</button>
      </div>
      <p style="color:#475569;font-size:0.75rem;text-align:center;margin:0.875rem 0 0;">No application fee · Results in 3 days</p>
    </div>
  </div>
</section>`,
};

const HIGHLIGHTS = {
  id: "sec-highlights-1",
  title: "College Highlights",
  category: "highlights",
  templateId: null,
  variantIndex: 0,
  code: `<section style="background:#0f172a;padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:3.5rem;">
      <div style="display:inline-block;background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.2);padding:0.35rem 1rem;border-radius:999px;margin-bottom:1rem;">
        <span style="color:#60a5fa;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Why Greenfield?</span>
      </div>
      <h2 style="color:#f8fafc;font-size:2.2rem;font-weight:900;letter-spacing:-0.03em;margin:0 0 0.75rem;">India's Premier<br/><span style="color:#2563eb;">Institution of Excellence</span></h2>
      <p style="color:#64748b;font-size:1rem;max-width:500px;margin:0 auto;line-height:1.7;">Recognised by NAAC, NIRF, NBA and 40+ global bodies for academic and research excellence.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.25rem;">
      <div style="background:linear-gradient(135deg,rgba(37,99,235,0.1),rgba(37,99,235,0.05));border:1px solid rgba(37,99,235,0.2);border-radius:16px;padding:2rem;text-align:center;">
        <div style="font-size:2.8rem;margin-bottom:0.375rem;">🏆</div>
        <div style="color:#f8fafc;font-size:2rem;font-weight:900;letter-spacing:-0.04em;">#42</div>
        <div style="color:#60a5fa;font-size:0.8rem;font-weight:700;margin-top:0.25rem;">NIRF National Rank</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(34,197,94,0.08),rgba(34,197,94,0.03));border:1px solid rgba(34,197,94,0.2);border-radius:16px;padding:2rem;text-align:center;">
        <div style="font-size:2.8rem;margin-bottom:0.375rem;">🎓</div>
        <div style="color:#f8fafc;font-size:2rem;font-weight:900;letter-spacing:-0.04em;">25,000+</div>
        <div style="color:#4ade80;font-size:0.8rem;font-weight:700;margin-top:0.25rem;">Active Students</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.03));border:1px solid rgba(245,158,11,0.2);border-radius:16px;padding:2rem;text-align:center;">
        <div style="font-size:2.8rem;margin-bottom:0.375rem;">💼</div>
        <div style="color:#f8fafc;font-size:2rem;font-weight:900;letter-spacing:-0.04em;">95%</div>
        <div style="color:#fbbf24;font-size:0.8rem;font-weight:700;margin-top:0.25rem;">Placement Rate</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(168,85,247,0.08),rgba(168,85,247,0.03));border:1px solid rgba(168,85,247,0.2);border-radius:16px;padding:2rem;text-align:center;">
        <div style="font-size:2.8rem;margin-bottom:0.375rem;">🔬</div>
        <div style="color:#f8fafc;font-size:2rem;font-weight:900;letter-spacing:-0.04em;">₹480 Cr</div>
        <div style="color:#c084fc;font-size:0.8rem;font-weight:700;margin-top:0.25rem;">Research Funding</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(239,68,68,0.08),rgba(239,68,68,0.03));border:1px solid rgba(239,68,68,0.2);border-radius:16px;padding:2rem;text-align:center;">
        <div style="font-size:2.8rem;margin-bottom:0.375rem;">🌍</div>
        <div style="color:#f8fafc;font-size:2rem;font-weight:900;letter-spacing:-0.04em;">120+</div>
        <div style="color:#f87171;font-size:0.8rem;font-weight:700;margin-top:0.25rem;">Global Partners</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(20,184,166,0.08),rgba(20,184,166,0.03));border:1px solid rgba(20,184,166,0.2);border-radius:16px;padding:2rem;text-align:center;">
        <div style="font-size:2.8rem;margin-bottom:0.375rem;">📚</div>
        <div style="color:#f8fafc;font-size:2rem;font-weight:900;letter-spacing:-0.04em;">80+</div>
        <div style="color:#2dd4bf;font-size:0.8rem;font-weight:700;margin-top:0.25rem;">Programmes Offered</div>
      </div>
    </div>
    <div style="margin-top:2rem;padding:1.5rem 2rem;background:rgba(37,99,235,0.06);border:1px solid rgba(37,99,235,0.15);border-radius:14px;display:flex;justify-content:space-around;flex-wrap:wrap;gap:1rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:1.5rem;">🏅</span>
        <div><div style="color:#f8fafc;font-size:0.875rem;font-weight:700;">NAAC A++ Accredited</div><div style="color:#64748b;font-size:0.75rem;">Grade 3.82/4.00</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:1.5rem;">🌐</span>
        <div><div style="color:#f8fafc;font-size:0.875rem;font-weight:700;">QS World Rank 801–850</div><div style="color:#64748b;font-size:0.75rem;">2025 Rankings</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:1.5rem;">⭐</span>
        <div><div style="color:#f8fafc;font-size:0.875rem;font-weight:700;">NBA Accredited</div><div style="color:#64748b;font-size:0.75rem;">All Engineering Depts.</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:1.5rem;">🏢</span>
        <div><div style="color:#f8fafc;font-size:0.875rem;font-weight:700;">Institute of Eminence</div><div style="color:#64748b;font-size:0.75rem;">UGC Recognised</div></div>
      </div>
    </div>
  </div>
</section>`,
};

const COURSES = {
  id: "sec-courses-1",
  title: "Courses & Programmes",
  category: "courses",
  templateId: null,
  variantIndex: 0,
  code: `<section style="background:#1e293b;padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:3rem;flex-wrap:wrap;gap:1rem;">
      <div>
        <div style="display:inline-block;background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.2);padding:0.35rem 1rem;border-radius:999px;margin-bottom:0.875rem;">
          <span style="color:#60a5fa;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">80+ Programmes</span>
        </div>
        <h2 style="color:#f8fafc;font-size:2.2rem;font-weight:900;letter-spacing:-0.03em;margin:0;">Academic Programmes</h2>
        <p style="color:#64748b;margin:0.5rem 0 0;font-size:0.95rem;">UG · PG · Ph.D · Executive Education</p>
      </div>
      <a href="#" style="background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.25);color:#60a5fa;padding:0.625rem 1.25rem;border-radius:8px;text-decoration:none;font-size:0.875rem;font-weight:600;white-space:nowrap;">View All Programmes →</a>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.25rem;">
      <div style="background:#0f172a;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;transition:border-color 0.2s;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;">
          <div style="width:48px;height:48px;background:rgba(37,99,235,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">💻</div>
          <span style="background:rgba(34,197,94,0.1);color:#4ade80;font-size:0.7rem;font-weight:700;padding:0.25rem 0.625rem;border-radius:999px;border:1px solid rgba(34,197,94,0.2);">High Demand</span>
        </div>
        <h3 style="color:#f8fafc;font-size:1.1rem;font-weight:800;margin:0 0 0.5rem;letter-spacing:-0.02em;">B.Tech Computer Science</h3>
        <p style="color:#64748b;font-size:0.85rem;margin:0 0 1.25rem;line-height:1.6;">Specialisations in AI/ML, Cybersecurity, Cloud Computing and Data Science.</p>
        <div style="display:flex;gap:1rem;margin-bottom:1.25rem;">
          <div><div style="color:#60a5fa;font-size:0.8rem;font-weight:700;">Duration</div><div style="color:#94a3b8;font-size:0.8rem;">4 Years</div></div>
          <div><div style="color:#60a5fa;font-size:0.8rem;font-weight:700;">Seats</div><div style="color:#94a3b8;font-size:0.8rem;">120</div></div>
          <div><div style="color:#60a5fa;font-size:0.8rem;font-weight:700;">Avg Package</div><div style="color:#94a3b8;font-size:0.8rem;">₹18 LPA</div></div>
        </div>
        <a href="#" style="display:block;text-align:center;background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.25);color:#60a5fa;padding:0.625rem;border-radius:8px;text-decoration:none;font-size:0.85rem;font-weight:600;">View Details →</a>
      </div>
      <div style="background:#0f172a;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;">
          <div style="width:48px;height:48px;background:rgba(168,85,247,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🧠</div>
          <span style="background:rgba(168,85,247,0.1);color:#c084fc;font-size:0.7rem;font-weight:700;padding:0.25rem 0.625rem;border-radius:999px;border:1px solid rgba(168,85,247,0.2);">New</span>
        </div>
        <h3 style="color:#f8fafc;font-size:1.1rem;font-weight:800;margin:0 0 0.5rem;letter-spacing:-0.02em;">M.Tech AI &amp; Machine Learning</h3>
        <p style="color:#64748b;font-size:0.85rem;margin:0 0 1.25rem;line-height:1.6;">Industry-integrated curriculum with IBM, Google and NVIDIA research partnerships.</p>
        <div style="display:flex;gap:1rem;margin-bottom:1.25rem;">
          <div><div style="color:#c084fc;font-size:0.8rem;font-weight:700;">Duration</div><div style="color:#94a3b8;font-size:0.8rem;">2 Years</div></div>
          <div><div style="color:#c084fc;font-size:0.8rem;font-weight:700;">Seats</div><div style="color:#94a3b8;font-size:0.8rem;">60</div></div>
          <div><div style="color:#c084fc;font-size:0.8rem;font-weight:700;">Avg Package</div><div style="color:#94a3b8;font-size:0.8rem;">₹24 LPA</div></div>
        </div>
        <a href="#" style="display:block;text-align:center;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.25);color:#c084fc;padding:0.625rem;border-radius:8px;text-decoration:none;font-size:0.85rem;font-weight:600;">View Details →</a>
      </div>
      <div style="background:#0f172a;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;">
          <div style="width:48px;height:48px;background:rgba(245,158,11,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">📊</div>
          <span style="background:rgba(245,158,11,0.1);color:#fbbf24;font-size:0.7rem;font-weight:700;padding:0.25rem 0.625rem;border-radius:999px;border:1px solid rgba(245,158,11,0.2);">Top Rated</span>
        </div>
        <h3 style="color:#f8fafc;font-size:1.1rem;font-weight:800;margin:0 0 0.5rem;letter-spacing:-0.02em;">MBA Business Administration</h3>
        <p style="color:#64748b;font-size:0.85rem;margin:0 0 1.25rem;line-height:1.6;">Finance, Marketing, HR, Operations and Entrepreneurship specialisations.</p>
        <div style="display:flex;gap:1rem;margin-bottom:1.25rem;">
          <div><div style="color:#fbbf24;font-size:0.8rem;font-weight:700;">Duration</div><div style="color:#94a3b8;font-size:0.8rem;">2 Years</div></div>
          <div><div style="color:#fbbf24;font-size:0.8rem;font-weight:700;">Seats</div><div style="color:#94a3b8;font-size:0.8rem;">90</div></div>
          <div><div style="color:#fbbf24;font-size:0.8rem;font-weight:700;">Avg Package</div><div style="color:#94a3b8;font-size:0.8rem;">₹16 LPA</div></div>
        </div>
        <a href="#" style="display:block;text-align:center;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);color:#fbbf24;padding:0.625rem;border-radius:8px;text-decoration:none;font-size:0.85rem;font-weight:600;">View Details →</a>
      </div>
    </div>
  </div>
</section>`,
};

const PLACEMENTS = {
  id: "sec-placements-1",
  title: "Placements & Recruiters",
  category: "placements",
  templateId: null,
  variantIndex: 0,
  code: `<section style="background:#0f172a;padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:3.5rem;">
      <div style="display:inline-block;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);padding:0.35rem 1rem;border-radius:999px;margin-bottom:1rem;">
        <span style="color:#4ade80;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Class of 2025</span>
      </div>
      <h2 style="color:#f8fafc;font-size:2.2rem;font-weight:900;letter-spacing:-0.03em;margin:0 0 0.75rem;">Placements &amp; Recruiters</h2>
      <p style="color:#64748b;font-size:1rem;max-width:500px;margin:0 auto;">500+ companies visited campus. Our graduates are hired by the world's most respected organisations.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;margin-bottom:2.5rem;">
      <div style="background:#1e293b;border-radius:14px;padding:1.75rem;text-align:center;border:1px solid rgba(34,197,94,0.15);">
        <div style="color:#4ade80;font-size:2.2rem;font-weight:900;letter-spacing:-0.04em;">₹42 LPA</div>
        <div style="color:#94a3b8;font-size:0.8rem;margin-top:0.375rem;">Highest Package</div>
      </div>
      <div style="background:#1e293b;border-radius:14px;padding:1.75rem;text-align:center;border:1px solid rgba(37,99,235,0.15);">
        <div style="color:#60a5fa;font-size:2.2rem;font-weight:900;letter-spacing:-0.04em;">₹18 LPA</div>
        <div style="color:#94a3b8;font-size:0.8rem;margin-top:0.375rem;">Average Package</div>
      </div>
      <div style="background:#1e293b;border-radius:14px;padding:1.75rem;text-align:center;border:1px solid rgba(245,158,11,0.15);">
        <div style="color:#fbbf24;font-size:2.2rem;font-weight:900;letter-spacing:-0.04em;">500+</div>
        <div style="color:#94a3b8;font-size:0.8rem;margin-top:0.375rem;">Recruiters</div>
      </div>
      <div style="background:#1e293b;border-radius:14px;padding:1.75rem;text-align:center;border:1px solid rgba(168,85,247,0.15);">
        <div style="color:#c084fc;font-size:2.2rem;font-weight:900;letter-spacing:-0.04em;">95%</div>
        <div style="color:#94a3b8;font-size:0.8rem;margin-top:0.375rem;">Placement Rate</div>
      </div>
    </div>
    <div style="background:#1e293b;border-radius:16px;padding:2rem;border:1px solid rgba(148,163,184,0.08);">
      <div style="color:#94a3b8;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:1.25rem;text-align:center;">Top Recruiters 2025</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.875rem;justify-content:center;">
        ${["Google", "Microsoft", "Amazon", "Meta", "Apple", "Infosys", "TCS", "Wipro", "Accenture", "Deloitte", "Goldman Sachs", "JP Morgan", "Flipkart", "Razorpay", "CRED", "Zomato", "PhonePe", "Swiggy"].map(c => `<div style="background:#0f172a;border:1px solid rgba(148,163,184,0.12);border-radius:10px;padding:0.625rem 1.25rem;color:#94a3b8;font-size:0.85rem;font-weight:600;">${c}</div>`).join("")}
      </div>
    </div>
  </div>
</section>`,
};

const TESTIMONIALS = {
  id: "sec-testimonials-1",
  title: "Student Testimonials",
  category: "testimonials",
  templateId: null,
  variantIndex: 0,
  code: `<section style="background:#1e293b;padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:3.5rem;">
      <h2 style="color:#f8fafc;font-size:2.2rem;font-weight:900;letter-spacing:-0.03em;margin:0 0 0.75rem;">What Our Alumni Say</h2>
      <p style="color:#64748b;font-size:1rem;">Hear from graduates building careers at the world's top companies.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.25rem;">
      <div style="background:#0f172a;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;">
        <div style="color:#fbbf24;font-size:1.1rem;margin-bottom:1rem;">★★★★★</div>
        <p style="color:#cbd5e1;font-size:0.9rem;line-height:1.7;margin:0 0 1.5rem;">"Greenfield's AI Lab and faculty mentorship were transformative. Got placed at Google with ₹38 LPA — something I genuinely thought was out of reach."</p>
        <div style="display:flex;align-items:center;gap:0.875rem;">
          <div style="width:44px;height:44px;background:linear-gradient(135deg,#2563eb,#818cf8);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1rem;">A</div>
          <div><div style="color:#f8fafc;font-size:0.9rem;font-weight:700;">Arjun Mehta</div><div style="color:#60a5fa;font-size:0.78rem;">Software Engineer, Google · B.Tech CSE 2024</div></div>
        </div>
      </div>
      <div style="background:#0f172a;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;">
        <div style="color:#fbbf24;font-size:1.1rem;margin-bottom:1rem;">★★★★★</div>
        <p style="color:#cbd5e1;font-size:0.9rem;line-height:1.7;margin:0 0 1.5rem;">"The MBA programme's industry projects and case competitions gave me real-world exposure before graduation. Now leading a team at Deloitte."</p>
        <div style="display:flex;align-items:center;gap:0.875rem;">
          <div style="width:44px;height:44px;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1rem;">P</div>
          <div><div style="color:#f8fafc;font-size:0.9rem;font-weight:700;">Priya Sharma</div><div style="color:#fbbf24;font-size:0.78rem;">Senior Consultant, Deloitte · MBA 2023</div></div>
        </div>
      </div>
      <div style="background:#0f172a;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;">
        <div style="color:#fbbf24;font-size:1.1rem;margin-bottom:1rem;">★★★★★</div>
        <p style="color:#cbd5e1;font-size:0.9rem;line-height:1.7;margin:0 0 1.5rem;">"Research funding, publishing support and international collaborations — Greenfield is where serious researchers come. My PhD opened doors globally."</p>
        <div style="display:flex;align-items:center;gap:0.875rem;">
          <div style="width:44px;height:44px;background:linear-gradient(135deg,#10b981,#2563eb);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1rem;">R</div>
          <div><div style="color:#f8fafc;font-size:0.9rem;font-weight:700;">Dr. Riya Patel</div><div style="color:#4ade80;font-size:0.78rem;">Research Scientist, MIT · PhD CS 2022</div></div>
        </div>
      </div>
    </div>
  </div>
</section>`,
};

const CONTACT = {
  id: "sec-contact-1",
  title: "Contact / Enquiry",
  category: "contact",
  templateId: null,
  variantIndex: 0,
  code: `<section style="background:#0f172a;padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start;">
    <div>
      <div style="display:inline-block;background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.2);padding:0.35rem 1rem;border-radius:999px;margin-bottom:1.25rem;">
        <span style="color:#60a5fa;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Get In Touch</span>
      </div>
      <h2 style="color:#f8fafc;font-size:2rem;font-weight:900;letter-spacing:-0.03em;margin:0 0 1rem;">We're Here to Help</h2>
      <p style="color:#64748b;font-size:0.95rem;line-height:1.7;margin:0 0 2rem;">Our admissions team is available Mon–Sat, 9 AM to 6 PM. Reach us by phone, email or visit our campus.</p>
      <div style="display:flex;flex-direction:column;gap:1.25rem;">
        <div style="display:flex;gap:1rem;align-items:flex-start;">
          <div style="width:42px;height:42px;background:rgba(37,99,235,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.2rem;">📍</div>
          <div><div style="color:#f8fafc;font-size:0.9rem;font-weight:700;">Campus Address</div><div style="color:#64748b;font-size:0.85rem;margin-top:0.25rem;line-height:1.5;">Greenfield University Campus, NH-48,<br/>Bangalore - Mysore Highway, Karnataka 560100</div></div>
        </div>
        <div style="display:flex;gap:1rem;align-items:center;">
          <div style="width:42px;height:42px;background:rgba(34,197,94,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.2rem;">📞</div>
          <div><div style="color:#f8fafc;font-size:0.9rem;font-weight:700;">Admissions Helpline</div><div style="color:#4ade80;font-size:0.875rem;margin-top:0.2rem;">+91 80 2345 6789</div></div>
        </div>
        <div style="display:flex;gap:1rem;align-items:center;">
          <div style="width:42px;height:42px;background:rgba(245,158,11,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.2rem;">✉️</div>
          <div><div style="color:#f8fafc;font-size:0.9rem;font-weight:700;">Email</div><div style="color:#fbbf24;font-size:0.875rem;margin-top:0.2rem;">admissions@greenfield.edu.in</div></div>
        </div>
      </div>
    </div>
    <div style="background:#1e293b;border:1px solid rgba(148,163,184,0.1);border-radius:20px;padding:2rem;">
      <h3 style="color:#f8fafc;font-size:1.1rem;font-weight:800;margin:0 0 1.5rem;">Send an Enquiry</h3>
      <div style="display:flex;flex-direction:column;gap:0.875rem;">
        <input placeholder="Your Full Name" style="background:rgba(255,255,255,0.05);border:1px solid rgba(148,163,184,0.12);border-radius:8px;padding:0.75rem 1rem;color:#f8fafc;font-size:0.875rem;outline:none;font-family:inherit;width:100%;box-sizing:border-box;" />
        <input placeholder="Email Address" style="background:rgba(255,255,255,0.05);border:1px solid rgba(148,163,184,0.12);border-radius:8px;padding:0.75rem 1rem;color:#f8fafc;font-size:0.875rem;outline:none;font-family:inherit;width:100%;box-sizing:border-box;" />
        <input placeholder="Phone Number" style="background:rgba(255,255,255,0.05);border:1px solid rgba(148,163,184,0.12);border-radius:8px;padding:0.75rem 1rem;color:#f8fafc;font-size:0.875rem;outline:none;font-family:inherit;width:100%;box-sizing:border-box;" />
        <select style="background:rgba(255,255,255,0.05);border:1px solid rgba(148,163,184,0.12);border-radius:8px;padding:0.75rem 1rem;color:#94a3b8;font-size:0.875rem;outline:none;font-family:inherit;width:100%;">
          <option>Programme Interest</option>
          <option>B.Tech</option><option>M.Tech</option><option>MBA</option><option>Ph.D</option>
        </select>
        <textarea placeholder="Your message or question..." rows="4" style="background:rgba(255,255,255,0.05);border:1px solid rgba(148,163,184,0.12);border-radius:8px;padding:0.75rem 1rem;color:#f8fafc;font-size:0.875rem;outline:none;font-family:inherit;width:100%;box-sizing:border-box;resize:vertical;"></textarea>
        <button style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:0.875rem;border-radius:8px;border:none;font-size:0.95rem;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 14px rgba(37,99,235,0.35);">Send Enquiry</button>
      </div>
    </div>
  </div>
</section>`,
};

const FOOTER = {
  id: "sec-footer-1",
  title: "Footer",
  category: "footer",
  templateId: null,
  variantIndex: 0,
  code: `<footer style="background:#090d16;padding:3.5rem 2.5rem 1.5rem;font-family:'Inter',system-ui,sans-serif;border-top:1px solid rgba(148,163,184,0.08);">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:2.5fr 1fr 1fr 1fr;gap:2.5rem;margin-bottom:3rem;">
      <div>
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
          <div style="width:36px;height:36px;background:linear-gradient(135deg,#2563eb,#1d4ed8);border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <span style="color:#fff;font-weight:900;font-size:0.95rem;">G</span>
          </div>
          <div>
            <div style="color:#f8fafc;font-weight:800;font-size:0.95rem;">Greenfield University</div>
            <div style="color:#475569;font-size:0.65rem;letter-spacing:0.05em;">Est. 1964 · NAAC A++</div>
          </div>
        </div>
        <p style="color:#475569;font-size:0.85rem;line-height:1.7;max-width:280px;margin:0 0 1.5rem;">Shaping tomorrow's innovators and leaders since 1964 through cutting-edge education, research, and global partnerships.</p>
        <div style="display:flex;gap:0.625rem;">
          ${["𝕏","in","f","▶","📸"].map(icon => `<a href="#" style="width:34px;height:34px;background:rgba(148,163,184,0.08);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#64748b;text-decoration:none;font-size:0.85rem;border:1px solid rgba(148,163,184,0.1);">${icon}</a>`).join("")}
        </div>
      </div>
      <div>
        <h4 style="color:#94a3b8;font-size:0.7rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 1rem;">Academics</h4>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.625rem;">
          ${["Undergraduate","Postgraduate","PhD Programmes","Online Courses","Executive Ed"].map(l => `<li><a href="#" style="color:#475569;text-decoration:none;font-size:0.85rem;">${l}</a></li>`).join("")}
        </ul>
      </div>
      <div>
        <h4 style="color:#94a3b8;font-size:0.7rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 1rem;">Campus</h4>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.625rem;">
          ${["Library","Hostels","Sports Complex","Research Labs","Health Centre"].map(l => `<li><a href="#" style="color:#475569;text-decoration:none;font-size:0.85rem;">${l}</a></li>`).join("")}
        </ul>
      </div>
      <div>
        <h4 style="color:#94a3b8;font-size:0.7rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 1rem;">Connect</h4>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.625rem;">
          ${["Admissions","Placements","Alumni Network","News & Events","Contact Us"].map(l => `<li><a href="#" style="color:#475569;text-decoration:none;font-size:0.85rem;">${l}</a></li>`).join("")}
        </ul>
      </div>
    </div>
    <div style="border-top:1px solid rgba(148,163,184,0.08);padding-top:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
      <span style="color:#334155;font-size:0.8rem;">© 2025 Greenfield University. All rights reserved.</span>
      <div style="display:flex;gap:1.5rem;">
        ${["Privacy Policy","Terms of Use","Sitemap","RTI"].map(l => `<a href="#" style="color:#334155;text-decoration:none;font-size:0.8rem;">${l}</a>`).join("")}
      </div>
    </div>
  </div>
</footer>`,
};

const ABOUT_SECTION = {
  id: "sec-about-1",
  title: "About College",
  category: "about",
  templateId: null,
  variantIndex: 0,
  code: `<section style="background:#0f172a;padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;">
    <div>
      <div style="display:inline-block;background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.2);padding:0.35rem 1rem;border-radius:999px;margin-bottom:1.25rem;">
        <span style="color:#60a5fa;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Est. 1964 · 60 Years of Excellence</span>
      </div>
      <h2 style="color:#f8fafc;font-size:2.2rem;font-weight:900;letter-spacing:-0.03em;margin:0 0 1.25rem;line-height:1.1;">About<br/><span style="color:#2563eb;">Greenfield University</span></h2>
      <p style="color:#64748b;font-size:0.95rem;line-height:1.8;margin:0 0 1.25rem;">Founded in 1964 by Dr. Ramesh Greenfield, our university began as a small engineering college in Bangalore and has grown into one of India's most respected institutions with a global footprint.</p>
      <p style="color:#64748b;font-size:0.95rem;line-height:1.8;margin:0 0 2rem;">Today, we host 25,000+ students, 800+ faculty members, and maintain active research partnerships with MIT, Oxford, and Stanford. Our sprawling 500-acre campus houses world-class labs, a central library with 2 million volumes, and state-of-the-art sports facilities.</p>
      <div style="display:flex;flex-direction:column;gap:0.875rem;">
        ${[["NAAC A++ Accredited","Grade 3.82 / 4.00 — Highest in the region"],["Institute of Eminence","Awarded by UGC, Ministry of Education"],["ISO 9001:2015 Certified","Quality management across all departments"]].map(([t,d]) => `<div style="display:flex;gap:0.875rem;align-items:flex-start;"><div style="width:22px;height:22px;background:rgba(37,99,235,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;"><span style="color:#60a5fa;font-size:0.8rem;font-weight:900;">✓</span></div><div><div style="color:#f8fafc;font-size:0.875rem;font-weight:700;">${t}</div><div style="color:#64748b;font-size:0.8rem;margin-top:2px;">${d}</div></div></div>`).join("")}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
      ${[["60+","Years of Legacy","#2563eb"],["25K+","Students Enrolled","#4ade80"],["800+","Expert Faculty","#fbbf24"],["500","Acre Campus","#c084fc"]].map(([n,l,c]) => `<div style="background:#1e293b;border-radius:16px;padding:2rem;text-align:center;border:1px solid rgba(148,163,184,0.08);"><div style="color:${c};font-size:2.2rem;font-weight:900;letter-spacing:-0.04em;">${n}</div><div style="color:#64748b;font-size:0.8rem;margin-top:0.375rem;">${l}</div></div>`).join("")}
    </div>
  </div>
</section>`,
};

const FACILITIES = {
  id: "sec-facilities-1",
  title: "Campus Facilities & Infrastructure",
  category: "facilities",
  templateId: null,
  variantIndex: 0,
  code: `<section style="background:#0f172a;padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:3.5rem;">
      <div style="display:inline-block;background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.2);padding:0.35rem 1rem;border-radius:999px;margin-bottom:1rem;">
        <span style="color:#60a5fa;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">World-Class Infrastructure</span>
      </div>
      <h2 style="color:#f8fafc;font-size:2.2rem;font-weight:900;letter-spacing:-0.03em;margin:0 0 0.75rem;">Campus Facilities &amp; Life</h2>
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
        <h3 style="color:#f8fafc;font-size:1.15rem;font-weight:800;margin:0 0 0.5rem;">Innovation &amp; AI Labs</h3>
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
        <p style="color:#94a3b8;font-size:0.875rem;line-height:1.6;margin:0;">AC &amp; Non-AC suites, 24/7 biometric security, multi-cuisine dining, and vibrant student lounges.</p>
      </div>
    </div>
  </div>
</section>`,
};

const EVENTS = {
  id: "sec-events-1",
  title: "Upcoming Campus Events",
  category: "events",
  templateId: null,
  variantIndex: 0,
  code: `<section style="background:#1e293b;padding:5rem 2.5rem;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:3rem;flex-wrap:wrap;gap:1rem;">
      <div>
        <div style="display:inline-block;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);padding:0.35rem 1rem;border-radius:999px;margin-bottom:0.875rem;">
          <span style="color:#c084fc;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Happening This Season</span>
        </div>
        <h2 style="color:#f8fafc;font-size:2.2rem;font-weight:900;letter-spacing:-0.03em;margin:0;">Upcoming Events &amp; Fests</h2>
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
          <p style="color:#94a3b8;font-size:0.85rem;margin:0;line-height:1.5;">₹10 Lakhs prize pool with mentors from Google &amp; Microsoft.</p>
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
          <p style="color:#94a3b8;font-size:0.85rem;margin:0;line-height:1.5;">3 days of music, dance, theatre and pro-nights.</p>
        </div>
      </div>
      <div style="background:#0f172a;border:1px solid rgba(148,163,184,0.1);border-radius:16px;padding:1.75rem;display:flex;gap:1.5rem;align-items:flex-start;">
        <div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;padding:0.75rem 1rem;text-align:center;color:#fff;min-width:60px;">
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;">DEC</div>
          <div style="font-size:1.6rem;font-weight:900;line-height:1;">12</div>
        </div>
        <div>
          <span style="background:rgba(245,158,11,0.15);color:#fbbf24;font-size:0.7rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:4px;">Conference</span>
          <h3 style="color:#f8fafc;font-size:1.1rem;font-weight:800;margin:0.5rem 0 0.25rem;">Global AI &amp; Robotics Summit</h3>
          <p style="color:#94a3b8;font-size:0.85rem;margin:0;line-height:1.5;">Keynotes from IEEE fellows and venture pitch day.</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
};

// ─── Page definitions ─────────────────────────────────────────────────────────

const DEMO_PAGES = [
  {
    id: "page-home",
    slug: "/home",
    title: "Home",
    sections: [NAVBAR, HERO, HIGHLIGHTS, FACILITIES, COURSES, PLACEMENTS, EVENTS, TESTIMONIALS, FOOTER],
  },
  {
    id: "page-about",
    slug: "/about",
    title: "About",
    sections: [NAVBAR, ABOUT_SECTION, FACILITIES, FOOTER],
  },
  {
    id: "page-courses",
    slug: "/courses",
    title: "Courses",
    sections: [NAVBAR, COURSES, FOOTER],
  },
  {
    id: "page-admissions",
    slug: "/admissions",
    title: "Admissions",
    sections: [NAVBAR, HERO, FOOTER],
  },
  {
    id: "page-contact",
    slug: "/contact",
    title: "Contact",
    sections: [NAVBAR, CONTACT, FOOTER],
  },
];

// Seed the in-memory store with the initial demo data
for (const page of DEMO_PAGES) {
  store[page.slug] = page;
}

function buildResponse() {
  return { pages: Object.values(store) };
}

export async function GET() {
  return NextResponse.json(buildResponse());
}

/** Receives a full page save and persists it in memory so the editor reflects the updated state. */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as { pages?: unknown[] };
    if (Array.isArray(body?.pages)) {
      for (const page of body.pages as Array<{ slug?: string }>) {
        if (page?.slug) store[page.slug] = page;
      }
    }
  } catch {
    // Malformed body — return current state unchanged
  }
  return NextResponse.json(buildResponse());
}
