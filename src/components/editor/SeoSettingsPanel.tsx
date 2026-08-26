"use client";

import { useEffect, useState } from "react";
import { MapPin, MessageCircleQuestion, Plus, Search, Trash2 } from "lucide-react";

import type {
  SiteAeo,
  SiteGeo,
  SiteSettings,
  SiteSettingsPatch,
} from "@/lib/publishing-client";

/**
 * The screen where a college says what it is, and where.
 *
 * ── Why this exists ────────────────────────────────────────────────────────
 *
 * `seo.title` and `seo.description` had a database field, an API that
 * validated them and a renderer that emitted them — and no control anywhere in
 * the product that could set either. Every published site on the platform
 * therefore carried the same `<title>`: "Official Campus Portal — Powered by
 * XITE". The one SEO control a tenant had was a toggle deciding whether that
 * identical title got indexed.
 *
 * Location and the answer-engine facts had no storage either, so this screen is
 * the visible half of giving them some.
 *
 * ── Why the copy avoids the acronyms ──────────────────────────────────────
 *
 * The people using this run a college, not a marketing team. "Advanced GEO
 * Settings" describes nothing they recognise; "Where your campus is" does, and
 * it is the same field. Every card here says what the setting does to their
 * site rather than which discipline it belongs to — the technical names are in
 * the code and in the report, which is where they are useful.
 *
 * ── Saving ────────────────────────────────────────────────────────────────
 *
 * Each card saves on its own, as a patch, so two cards cannot overwrite each
 * other — and the server's answer replaces local state rather than an
 * optimistic update standing, because a value the server rejected must not be
 * left on screen looking saved.
 */

const CARD: React.CSSProperties = {
  borderRadius: "14px",
  border: "1px solid #E5E5E5",
  backgroundColor: "#FFFFFF",
  padding: "24px 28px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const LABEL: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#404040",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const FIELD: React.CSSProperties = {
  width: "100%",
  borderRadius: "9px",
  border: "1px solid #E5E5E5",
  padding: "10px 12px",
  fontSize: "13px",
  color: "#171717",
  boxSizing: "border-box",
  outline: "none",
  fontWeight: 400,
  backgroundColor: "#FFFFFF",
};

const HINT: React.CSSProperties = {
  fontSize: "11px",
  color: "#737373",
  fontWeight: 400,
  margin: 0,
  lineHeight: 1.5,
};

const BUTTON: React.CSSProperties = {
  borderRadius: "8px",
  backgroundColor: "#171717",
  color: "#FFFFFF",
  padding: "9px 18px",
  fontSize: "12px",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  alignSelf: "flex-start",
};

const GHOST_BUTTON: React.CSSProperties = {
  ...BUTTON,
  backgroundColor: "#FFFFFF",
  color: "#404040",
  border: "1px solid #E5E5E5",
};

/** A section heading with an icon, matching the rest of the settings screens. */
function CardHeader({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Search;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          backgroundColor: "#F5F5F5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: "16px", height: "16px", color: "#525252" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>{title}</h4>
        <p style={HINT}>{children}</p>
      </div>
    </div>
  );
}

/** Text input with a label, a hint and a character budget where one applies. */
function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  maxLength,
  multiline,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  type?: string;
}) {
  const over = maxLength !== undefined && value.length > maxLength;
  return (
    <label style={LABEL}>
      <span style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
        <span>{label}</span>
        {maxLength !== undefined && value.length > 0 && (
          <span style={{ fontWeight: 400, color: over ? "#DC2626" : "#A3A3A3" }}>
            {value.length}/{maxLength}
          </span>
        )}
      </span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          style={{ ...FIELD, resize: "vertical", lineHeight: 1.6 }}
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          style={FIELD}
        />
      )}
      {hint && <p style={HINT}>{hint}</p>}
    </label>
  );
}

const EMPTY_GEO: SiteGeo = {
  streetAddress: null,
  locality: null,
  region: null,
  postalCode: null,
  country: null,
  latitude: null,
  longitude: null,
  telephone: null,
  serviceAreas: [],
};

const EMPTY_AEO: SiteAeo = {
  organizationType: null,
  legalName: null,
  foundingYear: null,
  sameAs: [],
  faqs: [],
};

/** The kinds of institution this platform's tenants are. */
const ORGANIZATION_TYPES = [
  { value: "CollegeOrUniversity", label: "College or university" },
  { value: "EducationalOrganization", label: "Educational organisation" },
  { value: "School", label: "School" },
  { value: "HighSchool", label: "High school" },
  { value: "Organization", label: "Other organisation" },
];

const text = (value: string): string | null => value.trim() || null;

export function SeoSettingsPanel({
  settings,
  busy,
  onSave,
  siteUrl,
}: {
  settings: SiteSettings | null;
  busy: boolean;
  onSave: (patch: SiteSettingsPatch, describe: (s: SiteSettings) => string) => void;
  /** The address this site is canonical at, shown in the result preview. */
  siteUrl: string;
}) {
  /**
   * Local drafts, seeded from the server and re-seeded whenever it answers.
   *
   * A controlled input cannot be typed into if its value is read straight from
   * `settings`, because nothing writes back until the save round-trips. The
   * re-seed on every `settings` change is what makes a rejected save visibly
   * revert rather than leaving a value on screen that the site does not have.
   */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [geo, setGeo] = useState<SiteGeo>(EMPTY_GEO);
  const [aeo, setAeo] = useState<SiteAeo>(EMPTY_AEO);

  useEffect(() => {
    if (!settings) return;
    setTitle(settings.seo.title ?? "");
    setDescription(settings.seo.description ?? "");
    setOgImageUrl(settings.seo.ogImageUrl ?? "");
    setGeo(settings.geo ? { ...EMPTY_GEO, ...settings.geo } : EMPTY_GEO);
    setAeo(settings.aeo ? { ...EMPTY_AEO, ...settings.aeo } : EMPTY_AEO);
  }, [settings]);

  const patchGeo = (next: Partial<SiteGeo>) => setGeo((prev) => ({ ...prev, ...next }));
  const patchAeo = (next: Partial<SiteAeo>) => setAeo((prev) => ({ ...prev, ...next }));

  const saveSearch = () =>
    onSave(
      {
        seo: {
          title: text(title),
          description: text(description),
          ogImageUrl: text(ogImageUrl),
        },
      },
      () => "Search appearance saved. It applies the next time you publish.",
    );

  const saveGeo = () =>
    onSave({ geo }, (s) =>
      s.geo ? "Location saved." : "Location cleared — your site no longer states where you are.",
    );

  const saveAeo = () =>
    onSave({ aeo }, (s) =>
      s.aeo
        ? "Saved. Search and AI assistants can now quote these facts."
        : "Cleared — your site no longer publishes these facts.",
    );

  /**
   * What the tenant is actually editing: a result in a list.
   *
   * A title-length counter tells somebody they have used 71 of 120 characters
   * and nothing about whether the result reads well. This shows the thing
   * itself, which is the only way to judge it.
   */
  const previewTitle = title.trim() || "Official Campus Portal — Powered by XITE";
  const previewDescription =
    description.trim() || "No description yet — search engines will use whatever text they find on the page.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#737373",
          }}
        >
          HOW PEOPLE FIND YOU
        </span>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: 700,
            color: "#171717",
            lineHeight: 1.15,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Search &amp; Location
        </h1>
      </div>

      {/* ── Search appearance ─────────────────────────────────────────── */}
      <div style={CARD}>
        <CardHeader icon={Search} title="How your site appears in search">
          The title and summary Google shows, and the picture that appears when someone shares a
          link to your site.
        </CardHeader>

        {/* The result, as it will look. */}
        <div
          style={{
            borderRadius: "10px",
            border: "1px solid #E5E5E5",
            backgroundColor: "#FAFAFA",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
          }}
        >
          <span style={{ fontSize: "11px", color: "#166534", wordBreak: "break-all" }}>{siteUrl}</span>
          <span
            style={{
              fontSize: "15px",
              color: "#1A0DAB",
              fontWeight: 500,
              lineHeight: 1.3,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {previewTitle}
          </span>
          <span style={{ fontSize: "12px", color: "#4D5156", lineHeight: 1.5 }}>
            {previewDescription}
          </span>
        </div>

        <Field
          label="Page title"
          hint="Your institution's name, and what it is. Google usually shows about 60 characters."
          value={title}
          onChange={setTitle}
          maxLength={120}
          placeholder="Greenfield College of Engineering, Chennai"
        />
        <Field
          label="Summary"
          hint="One or two sentences a prospective student would find useful."
          value={description}
          onChange={setDescription}
          maxLength={320}
          multiline
          placeholder="An autonomous engineering college in Chennai, offering eight undergraduate programmes…"
        />
        <Field
          label="Social preview image"
          hint="A full web address, starting with https://. Shown when your site is shared on WhatsApp, LinkedIn or X."
          value={ogImageUrl}
          onChange={setOgImageUrl}
          placeholder="https://example.edu/campus.jpg"
        />

        <button type="button" onClick={saveSearch} disabled={busy} style={BUTTON}>
          {busy ? "Saving…" : "Save search appearance"}
        </button>
      </div>

      {/* ── Location ──────────────────────────────────────────────────── */}
      <div style={CARD}>
        <CardHeader icon={MapPin} title="Where your campus is">
          People search for colleges by place — &ldquo;engineering college in Coimbatore&rdquo;,
          &ldquo;colleges near me&rdquo;. Filling this in is what lets your site answer those.
          Everything here is optional.
        </CardHeader>

        <Field
          label="Street address"
          value={geo.streetAddress ?? ""}
          onChange={(v) => patchGeo({ streetAddress: text(v) })}
          placeholder="12 Anna Salai"
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
          <Field
            label="City or town"
            value={geo.locality ?? ""}
            onChange={(v) => patchGeo({ locality: text(v) })}
            placeholder="Chennai"
          />
          <Field
            label="State or region"
            hint="A code such as IN-TN is understood most widely."
            value={geo.region ?? ""}
            onChange={(v) => patchGeo({ region: text(v) })}
            placeholder="IN-TN"
          />
          <Field
            label="Postal code"
            value={geo.postalCode ?? ""}
            onChange={(v) => patchGeo({ postalCode: text(v) })}
            placeholder="600002"
          />
          <Field
            label="Country"
            hint="Two letters — IN, US, AE."
            value={geo.country ?? ""}
            onChange={(v) => patchGeo({ country: text(v)?.toUpperCase() ?? null })}
            maxLength={2}
            placeholder="IN"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
          <Field
            label="Latitude"
            hint="Optional, but it puts you on a map. Both or neither."
            value={geo.latitude === null ? "" : String(geo.latitude)}
            onChange={(v) => patchGeo({ latitude: v.trim() === "" ? null : Number(v) })}
            placeholder="13.0827"
          />
          <Field
            label="Longitude"
            value={geo.longitude === null ? "" : String(geo.longitude)}
            onChange={(v) => patchGeo({ longitude: v.trim() === "" ? null : Number(v) })}
            placeholder="80.2707"
          />
          <Field
            label="Telephone"
            value={geo.telephone ?? ""}
            onChange={(v) => patchGeo({ telephone: text(v) })}
            placeholder="+91 44 1234 5678"
          />
        </div>

        <Field
          label="Areas you serve or recruit from"
          hint="Comma-separated. Districts, states or regions students come to you from."
          value={(geo.serviceAreas ?? []).join(", ")}
          onChange={(v) =>
            patchGeo({
              serviceAreas: v
                .split(",")
                .map((area) => area.trim())
                .filter(Boolean),
            })
          }
          placeholder="Tamil Nadu, Puducherry, Kerala"
        />

        <button type="button" onClick={saveGeo} disabled={busy} style={BUTTON}>
          {busy ? "Saving…" : "Save location"}
        </button>
      </div>

      {/* ── Facts a machine can quote ─────────────────────────────────── */}
      <div style={CARD}>
        <CardHeader icon={MessageCircleQuestion} title="Facts and answers">
          Search results and AI assistants quote facts, not paragraphs. What you put here is
          published in a form they can read directly, so an assistant asked about your fees or your
          admissions can answer with your words rather than a guess.
        </CardHeader>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
          <label style={LABEL}>
            <span>Kind of institution</span>
            <select
              value={aeo.organizationType ?? "CollegeOrUniversity"}
              onChange={(event) => patchAeo({ organizationType: event.target.value })}
              style={FIELD}
            >
              {ORGANIZATION_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Registered name"
            hint="Only if it differs from the name on your site."
            value={aeo.legalName ?? ""}
            onChange={(v) => patchAeo({ legalName: text(v) })}
            placeholder="Greenfield Educational Trust"
          />
          <Field
            label="Founded"
            value={aeo.foundingYear === null ? "" : String(aeo.foundingYear)}
            onChange={(v) => patchAeo({ foundingYear: v.trim() === "" ? null : Number(v) })}
            placeholder="1974"
          />
        </div>

        <Field
          label="Your profiles elsewhere"
          hint="Comma-separated full web addresses. These tell search engines that those pages and this site are the same institution."
          value={(aeo.sameAs ?? []).join(", ")}
          onChange={(v) =>
            patchAeo({
              sameAs: v
                .split(",")
                .map((link) => link.trim())
                .filter(Boolean),
            })
          }
          placeholder="https://www.linkedin.com/school/…, https://en.wikipedia.org/wiki/…"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#404040" }}>
            Questions people ask
          </span>

          {(aeo.faqs ?? []).length === 0 && (
            <p style={HINT}>
              None yet. Fees, hostel, placements and admission dates are the four asked most often.
            </p>
          )}

          {(aeo.faqs ?? []).map((faq, index) => (
            <div
              key={index}
              style={{
                borderRadius: "10px",
                border: "1px solid #F0F0F0",
                backgroundColor: "#FAFAFA",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <input
                  value={faq.question}
                  placeholder="What are the tuition fees?"
                  onChange={(event) =>
                    patchAeo({
                      faqs: aeo.faqs.map((entry, i) =>
                        i === index ? { ...entry, question: event.target.value } : entry,
                      ),
                    })
                  }
                  style={{ ...FIELD, fontWeight: 500 }}
                />
                <button
                  type="button"
                  aria-label="Remove this question"
                  title="Remove this question"
                  onClick={() => patchAeo({ faqs: aeo.faqs.filter((_, i) => i !== index) })}
                  style={{
                    border: "1px solid #E5E5E5",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Trash2 style={{ width: "14px", height: "14px", color: "#B91C1C" }} />
                </button>
              </div>
              <textarea
                rows={2}
                value={faq.answer}
                placeholder="₹80,000 per year for the B.E. programme, including laboratory fees."
                onChange={(event) =>
                  patchAeo({
                    faqs: aeo.faqs.map((entry, i) =>
                      i === index ? { ...entry, answer: event.target.value } : entry,
                    ),
                  })
                }
                style={{ ...FIELD, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => patchAeo({ faqs: [...(aeo.faqs ?? []), { question: "", answer: "" }] })}
            style={{ ...GHOST_BUTTON, display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus style={{ width: "14px", height: "14px" }} />
            Add a question
          </button>

          {/* Said plainly rather than left to be discovered: a question with no
              answer is not published, because the format requires both. */}
          <p style={HINT}>
            A question without an answer is not published — both parts are needed.
          </p>
        </div>

        <button type="button" onClick={saveAeo} disabled={busy} style={BUTTON}>
          {busy ? "Saving…" : "Save facts and answers"}
        </button>
      </div>
    </div>
  );
}
