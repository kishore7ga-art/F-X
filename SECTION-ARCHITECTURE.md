# The section system

Read this before adding a section type, a variant, or a surface that renders
sections. It describes what a section actually is here, the one environment it
renders into, and the three rules that keep the Admin, the editor and the
published site showing the same thing.

---

## 1. What a section is

Not what a section usually is, so it is worth saying plainly.

There is **no component-based section architecture**. No registry mapping a type
to a React component, no per-section components, no `content` / `styles` /
`layout` configuration objects.

A section is a row:

```ts
{
  id: string;          // stable across reorders, edits and swaps
  title: string;
  sectionType: string; // one of the 20 canonical ids, or "custom"
  templateId: string | null;  // which library template it is showing
  variantIndex: number;
  code: string;        // ← the section. Raw HTML, rendered as-is.
  sortOrder: number;   // always equal to the array index
}
```

`code` is hand-authored HTML, stored as a string, and rendered with
`dangerouslySetInnerHTML`. **The design is the string.**

That has a consequence worth internalising: an entire class of bug cannot occur
here. There is no partial-config persistence to lose, no
`config.value || defaultValue` quietly replacing a saved value, no nested object
dropped in serialisation. `normalizeConfig` round-trips every field.

When a section looks different on two surfaces, the cause is **the environment
the string was dropped into**, not the string.

---

## 2. The three surfaces

| | Admin preview | Editor canvas | Published site |
| :--- | :--- | :--- | :--- |
| Where | its own `<iframe>` | the studio's document | the app's document |
| Built by | `buildSectionPreviewDocument` | `sectionCanvasHtml` + `useSectionRuntime` | same as the editor |
| Section CSS | global within the iframe | fenced to `[data-xite-section="<id>"]` | same as the editor |
| Wrapper | direct child of `<body>` | `.section-canvas-box` inside `.xite-site-canvas` | same as the editor |

All three call `sectionRuntimeCss()` and `sectionResponsiveCss()`. That is the
single environment builder. **Anything that renders a section must go through
it.**

---

## 3. Containment — the rule that matters most

In the Admin's iframe a section inherits nothing. In the other two it renders
inside the application's document, which inherits a great deal:

- `<html class="dark bg-black text-white font-sans antialiased scroll-smooth">`
- `globals.css`, which sets font smoothing and text rendering on `body` and
  hides every scrollbar with a rule on `*`
- **two Tailwind preflights** — `globals.css` does `@import "tailwindcss"` (v4)
  while sections are compiled by the Tailwind Play CDN (v3)

So a section is tuned against one environment and ships into another, for
reasons nobody authoring it can see.

`sectionRuntimeCss(scope)` closes that. Every **inherited** CSS property is
reset at the canvas boundary with `revert`, which rolls it back to the
user-agent value — precisely what the iframe would have done. Inherited
properties are the only ones that can cross into section markup from an
ancestor, so resetting all of them is *complete* rather than anecdotal.

Preflight rules are not inherited — they target elements (`h1`, `ul`, `img`) —
so the base styles the two Tailwind majors disagree about are restated
separately.

Everything in the containment layer uses `:where()`, so it carries zero
specificity:

> **Containment decides what an ancestor may say about a section. Never what
> the section may say about itself.**

A section's own CSS, and its Tailwind classes, still win every fight they
should.

### What this replaced

`hostReset` used to undo exactly three properties — font smoothing, text
rendering and scrollbar hiding — each named after a symptom somebody had
chased down. A list of symptoms grows one incident at a time and is silently
wrong the moment anyone adds a global style to the app.

---

## 4. One registry

`src/lib/sections/categories.ts` holds the 20 canonical ids and the alias table
that maps anything else onto them. It is byte-identical in **xite-F**, **xite-B**
and **xite-admin**, and the drift gate fails the build in any of them if that
stops being true.

Two things about the alias table are load-bearing, and both are ordering:

- `"admission"` is tested **before** `"mission"`, or every Admissions section
  files under Vision & Mission.
- `"cta"` is tested **before** `"apply"`, because a call-to-action banner's copy
  is nearly always "Apply Now".
- `"campus life"` is tested **before** `"campus"`, or Gallery swallows Campus
  Facilities.

### What this replaced

The Admin panel declared its own twenty ids, four of which the platform does not
use: `header`, `admission`, `awards` and `cta`. The first three survived on
aliases. **`cta` did not** — it resolved to `custom`, and `custom` is
deliberately excluded from every variant cycle.

So every Call to Action template an admin published was invisible in the
editor's picker and could never be swapped. Nothing reported it, because from
the Admin's side the template saved perfectly.

`Templates.tsx` carried a fifth resolver on top of that — six string tests with
hand-written special cases — so a template could count towards a card on one
screen and be missing from another.

---

## 5. The two sanitiser policies

They disagree about `<script>`, deliberately:

| | `sanitizeTemplateCode` | `sanitizeSectionHtml` |
| :--- | :--- | :--- |
| Guards | admin-authored library templates | tenant-saved section markup |
| `<script>` | **allowed** — the library contains carousels and menus | **discarded** — this renders on the platform apex |
| SVG | shared allowlist | shared allowlist |

A section crosses that boundary the first time a tenant saves it, which is why
`restoreTemplateScripts` exists: it puts the script back **on read**, looked up
from the `Template` row by `templateId`. It is never taken from a request, so
the worst a forged `templateId` achieves is running a script an administrator
already published.

They must **not** also disagree about what an SVG is. Both use
`lib/sections/svg-allowlist.ts` — an allowlist that keeps `<svg>` and `<path>`
but drops `<clipPath>`, `<linearGradient>` and `fill-rule` renders a crest as
broken line-art and a social icon inside out, and nothing throws.

---

## 6. Adding a section type

1. Add the id to `SECTION_CATEGORY_IDS` in `lib/sections/categories.ts`, plus
   any aliases. Mind the ordering rules in §4.
2. Copy the file to **xite-B** and **xite-admin**, then
   `node scripts/check-shared-files.mjs --update` in xite-F and copy the
   manifest to the other two.
3. Add a card to `SECTION_CATEGORIES` in `EditorStudio.tsx` and an entry to
   `PLATFORM_SECTION_CATEGORIES` in xite-admin.

Steps 1 and 3 are enforced: the Admin's list is `satisfies readonly
CategoryItem[]`, its icon map is a `Record<SectionCategoryId, …>`, and a
compile-time assertion checks every canonical category is offered. Miss one and
the build fails rather than the templates going quiet.

**You do not write a renderer.** There isn't one to write.

---

## 7. Adding a surface that renders sections

Call `sectionCanvasHtml(code)` for the markup and `useSectionRuntime({ sections,
scope })` for the environment. That is the whole contract.

Do not write a second document stripper. The editor had one, it disagreed with
the site's about whether a `<style>` block stayed in the markup, and the result
was every section's CSS in the document twice — once fenced, once loose,
restyling every other section on the page.

`fillViewport` is the one knob: `true` (default) reserves a screenful of the
site's own background, which a published page wants and the editor does not.

---

## 8. What holds this together

`src/lib/section-parity.test.ts` is a **contract, not a set of examples**. It
asserts that the three surfaces render the same markup, define the same layout
primitives, establish the same container, and that containment covers the
properties the app actually sets.

A fourth surface written by hand, or a new global style added to the app, fails
it.

Alongside it:

| Guard | Catches |
| :--- | :--- |
| `section-parity.test.ts` | a surface that diverges from the shared environment |
| `section-runtime.test.ts` | the canvas contract and the edit round-trip |
| `svg-survival.test.ts` (xite-B) | an allowlist that quietly breaks logos |
| `sanitize-policies.test.ts` (xite-B) | the two policies drifting on `<script>` |
| `categories.test.ts` (xite-B) | alias ordering |
| drift gate, all three repos | `section-runtime.ts` or `categories.ts` diverging |
| `satisfies` + `Record<SectionCategoryId, …>` | a category added in one place only |

---

## 9. Known, and open

- **The Tailwind Play CDN.** Sections are compiled at runtime by a CDN that
  prints its own "should not be used in production" warning on every tenant
  site, ships a compiler to every visitor, and puts section rendering one
  third-party outage from unstyled. Its preflight is neutralised inside the
  canvas; replacing it means precompiling the utilities sections actually use,
  which is a project rather than a fix.
- **Templates damaged before the SVG allowlist was corrected** were stripped on
  write and do not repair themselves. Re-saving one in Admin › Templates puts it
  through the corrected pass.
- **Sections predating `templateId`** carry `null`, so `restoreTemplateScripts`
  cannot find their script. The editor labels them as rendering empty.
- **Visitors can only reach the home page.** Per-page editing works and
  persists, but no public route takes a page slug.
