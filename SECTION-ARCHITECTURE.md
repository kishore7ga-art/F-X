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

The editor's canvas markup sits in one extra element — a `display: contents`
wrapper, because `dangerouslySetInnerHTML` cannot share a node with the
empty-section notice. `display: contents` is load-bearing: the element has no
box, so `.section-canvas-box` is laid out as a direct child of the section
wrapper, exactly as on the published site. It also carries **no classes**. It
used to carry `w-full block p-0 m-0 text-left`, and `text-align` is inherited —
so an editor utility class was deciding the text alignment of every section on
the canvas, inside the containment boundary where nothing resets it.

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

Preflight rules are the one thing a reset on the canvas cannot reach, and the
two majors disagree in a way no rule named after an element could cover:
**Tailwind 4 zeroes margin and padding on the universal selector**, and
Tailwind 3 does it element by element. So anything on neither of v3's lists —
an `<option>`, a `<td>`, a `<fieldset>` — kept its browser padding in the
Admin's iframe and lost it on the other two surfaces. The containment layer
therefore opens with `:where(*) { margin: revert; padding: revert }`, at zero
specificity, so v3's own preflight then wins on the elements it covers. Which
is the Admin's cascade, reproduced.

### What this replaced

`hostReset` used to undo exactly three properties — font smoothing, text
rendering and scrollbar hiding — each named after a symptom somebody had
chased down. A list of symptoms grows one incident at a time and is silently
wrong the moment anyone adds a global style to the app.

---

## 3a. Units — the other thing an environment decides

Containment settles what an ancestor may say about a section. It says nothing
about what a *unit* means, and two of them are resolved against the document
rather than against the section:

| | the section is this wide | `100vw` is |
| :--- | :--- | :--- |
| Admin preview | the iframe | the iframe — *the same* |
| Editor canvas | the selected width, 1440 | the studio window, 1920 |
| Published site | the window | the window — *the same* |

Sections in this library are full-bleed and stay that way with `vw`:
`padding: clamp(0.75rem, 1.2vw, 1.5rem) clamp(1rem, 3.5vw, 4rem)` on a header
bar, `font-size: clamp(2.3rem, 3.4vw, 4rem)` on a wordmark. The platform's own
default header uses eleven of them. In the editor every one resolved against
the operator's monitor: on a 1920px window showing a 1440px canvas the header's
side padding came out at 64px instead of 50 and the wordmark at 62px instead of
49 — visibly taller and looser than the Admin had just shown, from markup
neither side had touched.

`viewportUnitsToContainer` rewrites `vw` as `cqw` — 1% of the query container,
which *is* the box the section occupies on all three surfaces. Same
substitution as `@media` → `@container`, same reason. It runs on all three
surfaces, in `sectionCanvasHtml`, `buildSectionPreviewDocument` and
`buildSectionRuntimeStylesheet`, and it reaches inline `style` attributes as
well as `<style>` blocks, because that is where half a section's CSS lives.

It is a **render-time** substitution. What is stored stays `vw`:
`recomposeSectionCode` and the editor's read-back funnel apply
`containerUnitsToViewport`, exactly as they apply `detokenizeSectionHtml` to the
theme tokens, and for the same reason — a section is not edited by being looked
at.

`vh`, `vmin` and `vmax` are left alone; see §9.

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
scope })` for the environment. That is the whole contract. Put nothing with a
class or a style between the canvas and `.section-canvas-box`, and add the
surface to `scripts/section-parity-dom.ts`.

What `useSectionRuntime` installs is `buildSectionRuntimeStylesheet` — a
function, so the parity harness can ask for the editor's real CSS without
rendering the editor. The hook is only the effect around it.

Do not write a second document stripper. The editor had one, it disagreed with
the site's about whether a `<style>` block stayed in the markup, and the result
was every section's CSS in the document twice — once fenced, once loose,
restyling every other section on the page.

`fillViewport` is the one knob: `true` (default) reserves a screenful of the
site's own background, which a published page wants and the editor does not.

---

## 7a. Editing a section — the toolbar

Selecting a section on the canvas opens `SectionToolbar`, whose controls are
derived from the section rather than declared per section type. The chain:

```text
section.code
   │  splitSectionCode          head links, stylesheet, body markup
   ▼
probeSection                    what the markup actually contains
   │
   ▼
buildSectionSchema              groups of controls, in this category's order
   │
   ▼
applyControl / applyListAction  a new section.code
   │
   ▼
setSectionsWithHistory          undo, autosave, page isolation — for free
```

Four properties are load-bearing, and each replaces a mistake that is easy to
make here.

**A section has no configuration object, so a control edits the string.**
`lib/sections/html-dom.ts` parses to a tree carrying **source offsets**, and
every edit is a splice on the original string. Parsing to a DOM and serialising
back would normalise attribute order, quoting and whitespace across the whole
section, so changing one font size would produce a diff touching every line —
and an undo entry and an autosave for markup nobody edited. It is also pure TS:
`DOMParser` is browser-only and this repo has no jsdom, and an edit pipeline
that can only run in a browser is one nobody tests.

**Styling goes into a managed region of the section's own stylesheet, not into
inline styles.** An inline style has no device, so a control that wrote one
could not give Desktop and Mobile different values without one overwriting the
other. The region is delimited by CSS comments — a `<style>` attribute does not
survive the round trip, because `extractStylesAndBody` merges every block into
one and `sanitizeSectionHtml` rebuilds `<style>` with its attributes dropped.
Elements are addressed by a lazily-stamped `data-xite-el`, which `data-*`
survives sanitisation.

**Every managed declaration is `!important`.** Not a shortcut: the library is
authored almost entirely in inline styles — the platform's own hero opens
`<h1 style="font-size:56px…">` — and no selector beats an inline style at any
specificity. The fence is `:where()`, which carries no specificity by design,
and the runtime stylesheet is placed *before* Tailwind's Play CDN sheet. Three
independent ways for a correct rule to be inert.

**Responsive uses the engine that already exists.** Device values are written
as `@media (max-width: …)`, which `viewportMediaToContainer` turns into
`@container xite` on all three surfaces — so a mobile value resolves against the
box the section occupies rather than against the operator's monitor. Visibility
is the exception: `display: none` on a cascading tier reaches every narrower
one, and there is no value that undoes it (`revert` rolls back past the
author's own `display: flex`). So hiding uses two **exclusive** tiers whose
ranges cannot overlap — see `Tier` in `section-managed-css.ts`.

**Nothing is keyed on a section id.** Controls exist because the markup has
something for them to edit; the category supplies ordering and labels only. A
section type an administrator publishes next month gets card controls if it has
cards, and no image controls if it has no images, with no entry anywhere naming
it. `section-capabilities.ts` is the ordering table, and a category missing from
it falls back to the default order rather than losing its toolbar.

## 8. What holds this together

`src/lib/section-parity.test.ts` is a **contract, not a set of examples**. It
asserts that the three surfaces render the same markup, define the same layout
primitives, establish the same container, and that containment covers the
properties the app actually sets.

A fourth surface written by hand, or a new global style added to the app, fails
it.

Alongside it:

`section-parity.test.ts` is a statement about **strings**, and that is its
limit. It passed the whole time the Admin and the editor were visibly rendering
the same header differently, because the difference was never in the strings —
it was in what the two documents did with them.

`scripts/section-parity-dom.ts` (`npm run test:parity`) is the other half.
Both browser harnesses build their page from `scripts/section-dom-harness.ts`;
two hand-built copies of that environment would agree only until one of them was
touched, and then both would report success while measuring different browsers. It
builds both environments for real in Chromium — `buildSectionPreviewDocument`
on one side; the app's document, its compiled `globals.css`, Tailwind's Play
CDN, the theme layer and the DOM `EditorStudio` emits on the other — renders
ten sections at three widths on all three surfaces, and compares the computed
style of every element plus its box. 95,830 comparisons, and the number that
matters is zero.

Three of its ten fixtures are the platform's own default sections, taken
verbatim from `GET /api/v1/default-website`. That is deliberate: a synthetic
fixture only tests what its author thought to test, and every bug this found
lived in a construct nobody would have written on purpose.

Its one weakness is that it *reproduces* `EditorStudio`'s DOM rather than
mounting it, so a change to the canvas markup has to be made in both. The class
lists are copied verbatim to keep that honest.

| Guard | Catches |
| :--- | :--- |
| `section-parity.test.ts` | a surface that diverges from the shared environment |
| `section-parity-dom.ts` | a surface that renders differently despite agreeing on paper |
| `section-runtime.test.ts` | the canvas contract and the edit round-trip |
| `section-toolbar.test.ts` | the parse, the managed region and every control's edit |
| `section-toolbar-dom.ts` | a control that writes correct CSS the cascade then ignores |
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
- **`vh`, `vmin` and `vmax` still mean the window.** There is no
  container-relative height unit unless the container declares
  `container-type: size`, and that needs a height the canvas does not have — it
  is as tall as its sections. So a `height: 80vh` hero is the window's height in
  the editor and on the published site, which is what it will actually get, and
  the Admin's fixed-height preview iframe is the surface that disagrees. Closing
  it means the iframe canvas, below.

- **Templates damaged before the SVG allowlist was corrected** were stripped on
  write and do not repair themselves. Re-saving one in Admin › Templates puts it
  through the corrected pass.
- **Sections predating `templateId`** carry `null`, so `restoreTemplateScripts`
  cannot find their script. The editor labels them as rendering empty.
- **Visitors can only reach the home page.** Per-page editing works and
  persists, but no public route takes a page slug.
