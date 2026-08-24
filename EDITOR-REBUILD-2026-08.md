# Editor builder — audit and remediation, August 2026

What was broken in the Editor Studio, why, and what was done about it. Written
for whoever next has to change this code, so the reasoning behind the current
shape is recoverable without reading five commits.

Companion report (same content, formatted): the artifact published alongside
this work.

**Adding a section, a variant, or a surface that renders sections?** Read
[SECTION-ARCHITECTURE.md](./SECTION-ARCHITECTURE.md) first. This file is the
record of what was broken; that one is the contract for not breaking it again.

---

## Summary

Six faults were reported. Three root causes account for all of them.

| # | Reported as | Actual cause |
| :-- | :--- | :--- |
| P1 | Section swap fetches the wrong templates | The editor read an **admin-only** endpoint and got 401 |
| P2 | Reordering does not persist | Nothing saved it — a debounce every click restarted |
| P3 | Remove all AI | — |
| P4 | Theme switching is partial and not instant | The theme was a **destructive rewrite of stored markup** |
| P5 | Editing one page changes another | No store knew which page it was writing to |
| — | Styling does not apply after a template swap | Every section's CSS was **in the document twice** |

---

## 1. The 401 that looked like three separate bugs

The editor fetched `/api/v1/admin/templates` for its section library. That route
is guarded by `requireAdmin`. A college signs in with a `college_session`
cookie, which fails that guard, and the editor's `catch (e) {}` discarded the
401.

The template list was therefore empty for **every tenant in production,
always** — and never for a developer signed in as an admin. Everything
downstream then behaved exactly as designed on an empty list:

- **Add Section** greyed out all nineteen categories as "Not in library",
  which reads as a platform with no content.
- **Swap Variant** built a cycle of length one and reported "Only 1 variant —
  add more sections in Admin › Templates", which reads as an empty admin
  library.
- Neither message was ever shown: `showToastNotification` was
  `setToastMessage(null)` on every call.

**Fix.** `GET /api/v1/section-library` — the tenant-facing read of the same
collection. Published and non-archived rows only, one server-resolved category
per row, deterministic order (the order the swap cycle steps through; a cycle
whose order changes between two clicks is unusable).

---

## 2. Section swap (P1)

Three independent faults, each sufficient on its own.

1. **No templates** — the 401 above.

2. **Identity by string comparison.** The current variant was located with
   `template.code.trim() === section.code.trim()`. The moment a user edited text
   inline — the editor's headline feature — the section matched nothing, the
   search returned `-1`, and the code fell back to index 0. Swapping an edited
   section jumped to the first layout and silently discarded the edit.

   Identity is `templateId` now. Editing text does not change which template a
   section came from.

3. **Guards that excluded valid templates.** Two "STRICT SAFETY GUARDs" dropped
   any template whose markup contained the substring `<header` or `<footer`
   from every other category. A hero containing a `<header>` element — valid
   HTML, common in the library — was invisible to the hero cycle.

`swapVariant()` in `lib/section-variants.ts` is a pure function over the section
and the library, so the button, a keyboard shortcut and the tests take the same
path.

---

## 3. Reordering (P2)

The move worked. **Nothing saved it.**

- It relied on a 2-second debounced autosave that **every further click
  restarted**, so a user arranging six sections triggered no save at all until
  they stopped and waited.
- That save re-serialised **every page's full markup** into one `PUT` to
  express "these two swapped".
- Every error path was `catch (e) {}`, so a rejected save was
  indistinguishable from a successful one until the refresh.
- The guards did index arithmetic against `sections.length` and refused to move
  index 1 upward on **any** page — including pages with no navbar, where index 0
  is ordinary content.

**Fix.** `PATCH /api/v1/my-website/pages/:slug/order` takes a list of ids and
fires on the click. Sections the caller does not mention keep their relative
order rather than being deleted, so a client one version behind cannot drop a
section it has never heard of. Server-side, `sortOrder` is honoured on the way
in and then renumbered to the array index, so the field and the array can never
disagree. `canMove()` asks whether these two particular sections may trade
places.

---

## 4. AI removal (P3)

Deleted: `ai-service.ts`, `ai-optimize-service.ts`, both routes, the `ai`
rate-limit bucket, both OpenAPI operations, the editor drawer's AI tab and its
prompt state, the `onSectionAdd` prop that carried generated sections into the
canvas, and `GEMINI_API_KEY` from `.env.example` and `docker-compose.yml`.

Verified in production: `POST /api/v1/ai/generate-section` returns **404**,
where an unknown route also returns 404 and a live-but-guarded route returns
401 — so this is removal, not a redirect.

---

## 5. Themes (P4)

The old switch ran a find-and-replace over **every section's stored HTML** and
autosaved the result. Three consequences:

- **Destructive and one-way.** `#2563eb` became `#f59e0b`; switching back turned
  *every* `#f59e0b` blue, including colours the section was authored with. The
  information needed to undo it had been overwritten.
- **It missed almost everything** — twelve exact hex strings in four exact
  property spellings. `rgb()`, `#2563EB`, and every colour inside a `<style>`
  block were untouched.
- **It could not be instant across pages.** It rewrote only the page currently
  open, so a multi-page site ended up half one theme and half another.

**Fix.** All four themes ship as CSS custom properties keyed on
`data-xite-theme`. Switching sets **one attribute on one element** — every
section retints in the same frame, no reload, no markup re-render, and no
dependence on which page is open.

Colours become `var(--xite-accent, #original)` **at render time only**, with the
authored value as the fallback. The inverse pass (`detokenizeSectionHtml`) runs
on the way back out, so what reaches the database is what was authored.

Kept: **Academic Navy, Emerald & Gold, Crimson Maroon, Midnight Obsidian** — the
four present in both the picker and the hardcoded map, so no tenant loses a
theme they could have selected. `light-minimal` is dropped: its surface is white
and every library section is authored dark.

Themes reach the published site too, resolved server-side and present in the
first byte of HTML.

---

## 6. Page isolation (P5)

Five overlapping stores — `sections`, `pageStore`, `myWebsiteConfig` and two
localStorage keys — with four effects writing between them, none carrying the
page they were writing *for*. The failure, exactly:

1. `handlePageChange("/about")` set `currentPage` and started an async
   `fetchDbSections`. The slug committed immediately; `sections` still held
   Home's.
2. An effect on `[sections, currentPage.slug]` fired — because the slug had
   changed — and wrote `pageStore["/about"] = <Home's sections>`.
3. If About came back empty, the guard `sections.length > 0` skipped the
   corrective write, so the copy stayed.
4. The autosave persisted Home's sections to About.

A second path did the same: two `fetchDbSections` calls raced on every page
switch, and whichever resolved last won.

**Fix.** `hooks/useEditorPages.ts` is one reducer where **every action names its
page**. The page id is captured at call time, never read at apply time — so a
mutation dispatched moments before a page switch still lands on the page it was
made for. Loads are guarded by a per-page request token; saves go through a
per-page queue. `PUT /api/v1/my-website/pages/:slug` writes one page and the
server owns the rest.

Undo/redo are per page — the old pair of shared arrays meant an undo after a
page switch pasted the previous page's sections onto the current one.

localStorage is gone from the section path entirely and the stale keys are
purged on load. It was read **before** the database on the offline fallback,
which is how a cached copy could outlive a save and then be re-persisted over
it.

---

## 7. Section CSS applying to the wrong sections

Reported as "styling does not apply after a template swap". The swap was not the
cause; it was the moment the damage became visible.

**Every section's CSS was in the editor's document twice.**

`useSectionRuntime` lifts a section's `<style>` blocks out, fences each rule to
`:where([data-xite-section="<id>"])` and puts the result in one stylesheet in
`<head>`. That part worked. But the editor rendered its canvas through *its own*
document stripper, which **left every `<style>` block in the markup** — and, for
a section that was a full document, explicitly copied `<head>` back in.

Why the fenced copy never stood a chance:

- The fence adds `:where(...)`, which carries **zero specificity by design** —
  it decides what a rule can reach, never which rule wins.
- So both copies have **identical specificity**, and the tie breaks on document
  order.
- The fenced copy is in `<head>`; the inline copy is in `<body>`. **The inline
  copy always won.** Fencing was not bypassed — it was dead code in the editor.

With several sections on a page, a stylesheet saying `h2 { color: #e11d48 }` or
`.container { padding: 0 }` restyled **every other section**, and whichever
section sat last in the DOM won every conflict. Swapping replaced one of those
competing global stylesheets, so it visibly restyled sections the user had not
touched, and the swapped section often rendered under a different section's
rules.

The published site never had this — it already rendered `bodyHtml` from
`extractStylesAndBody`. So the editor and the live site disagreed, which is the
one thing a WYSIWYG canvas may not do.

**Fix.** One canvas function, `sectionCanvasHtml()`, in the shared runtime
module, called by the editor, the preview and the published site. The editor's
second stripper is deleted. A section's CSS now exists exactly once, fenced.

Four things had to move with it, because the inline copy was quietly carrying
them:

- **Themes.** The inline copy was the one the theme reached. The runtime now
  tokenises a section's CSS before fencing it.
- **`@import`.** `CSSStyleSheet.replaceSync()` discards `@import` rules, and
  `@import` is only valid at the top of a stylesheet. Every webfont a section
  imports that way would have vanished. Hoisted to `<link>` elements instead.
- **Inline text editing.** It captures an edit by reading markup back out of the
  live DOM, which now holds no `<style>`. Saving that verbatim would have
  **deleted the section's entire stylesheet the first time somebody fixed a
  typo.** `recomposeSectionCode()` takes the head from the stored section and
  the body from the canvas.
- **The canvas ground.** `sectionRuntimeCss` hardcoded `#09090b` and `#ffffff`.
  It reads `var(--xite-surface, #09090b)` now, with the literals as fallbacks so
  the Admin's iframe — which defines no tokens — is unchanged.

---

## 8. Two Tailwind engines in one document

`globals.css` is **Tailwind 4**, compiled at build time, for the app's own
chrome. Section markup is compiled at runtime by the **Tailwind Play CDN**.

Both emit `--tw-` variables — verified in `.next/static/chunks/*.css` — and both
`placeBeforeTailwind` and `useTailwindContainerQueries` located "Tailwind's
stylesheet" by searching for exactly that string.

The second one sets `sheet.disabled = true` on what it finds, so it could
**switch off the entire editor UI's styling** the moment a device preview was
opened. Production escapes it only because Next serves its CSS as `<link>`
rather than `<style>` — which makes it the kind of bug that appears on someone's
laptop and never in CI.

Both now use `findSectionTailwindStyle()`, which also excludes framework-owned
sheets (`data-precedence`, `data-href`, `data-n-href`).

---

## 9. Database mapping

`templateId` — the identity the variant cycle turns on, and the reason swapping
survives a user editing a section's text — was **not declared in
`SectionItemSchema`**. It persisted only because that schema happens to be
`strict: false`. Setting `strict: true` for any unrelated reason would have
silently broken variant swapping for every tenant, with the symptom appearing
nowhere near the change. Now declared.

Full chain verified: `Template.code/category` → `getSectionLibrary()` →
`sectionFromTemplate()` → `savePage()` → Mongo → `normalizeConfig()` → editor.

---

## 10. One rule for what a section is

`lib/sections/categories.ts` replaces four disagreeing copies of category
resolution — the editor's `normalizeCategory`, a second heuristic ladder inside
the swap handler, a third inside `loadAdminTemplates`, and a fourth in the Admin
Studio. A template filed as "Header Navigation" was a `navbar` to the picker and
a `custom` to the swap cycle.

Two aliases are load-bearing and were wrong:

- **"admission" must be tested before "mission"**, or every Admissions template
  files under Vision & Mission.
- **"campus life" before "campus"**, or Gallery swallows Campus Facilities.

Byte-identical in xite-F and xite-B, enforced by `npm run check:shared`.

`section-runtime.ts` is now under a drift gate in all three repos —
xite-admin has `scripts/check-section-runtime.mjs` wired into its `prebuild`.
It is the one file where drift stays invisible until a section renders one way
in the Admin's preview and another way live.

---

## 11. The black band below the last section

Reported after the CSS fix, in the editor at full width.

`sectionRuntimeCss` sets two things on the canvas together: the site's own
background colour, and `min-height: 100%`.

That pairing is correct on the **published site** — a short page should end in
the site's background rather than in a strip of whatever is behind it. It is
wrong in the **editor**, where the canvas sits on the studio's white surface.
There it paints a rectangle of the *site's* dark background below the last
section, with nothing in it, which reads as a section that failed to load
rather than as the end of the page.

Half of this had already been fixed: `min-h-screen` was removed from the
editor's canvas element, with a comment describing the exact symptom — *"a
tenant whose only section is a 102px header got that header and then a full
screen of flat black"*. The rule in the **shared stylesheet** was left in
place, so the band came back at whatever height the parent gave it.

**Fix.** `fillViewport` is a parameter on `sectionRuntimeCss`, defaulting to
`true` so the published site and the Admin's preview iframe keep the behaviour
without opting in. The editor passes `false`.

Also removed: 448px of stacked dead space. `main` carried `pb-64` (256px) *and*
a separate 192px spacer div, both reserving room for the same floating dock.
The dock is ~96px tall and sits 32px from the bottom, so one 160px spacer
clears it.

---

## 12. The black band: a section whose script was stripped

Reported as empty space in the editor. It is not space — it is a **section
whose content was assembled by JavaScript that no longer runs**, leaving its
own background and padding behind as a coloured rectangle with nothing in it.

Two sanitisers guard two paths and disagree about `<script>` on purpose:
`sanitizeTemplateCode` allows it (the library contains carousels, sliders and
hamburger menus); `sanitizeSectionHtml` discards it (tenant markup renders on
the platform apex, beside the sign-in page).

A section crosses that boundary the first time it is saved:

1. The admin publishes a slider whose slides are built by its script.
2. A tenant adds it. The editor runs the script; the slides appear.
3. The autosave writes it through `PUT /my-website`, which strips the script.
4. On reload the markup is there and the script is not — an empty band.

**Fix.** `restoreTemplateScripts` puts the script back on *read*. It is never
taken from the request: it is looked up from the `Template` row the section
came from, by `templateId`, and only for templates still published and
unarchived. A tenant may put any `templateId` they like in a body; the worst
they achieve is running a script an administrator already published to the
whole platform. Relaxing the sanitiser instead would have fixed the symptom
and opened the hole it exists to close.

Applied to the editor's `GET /my-website` and both public site paths, so
nothing is written back and the stored draft stays exactly as sanitised. One
query per request, none at all when no section references a template.

**Known gap.** The restore keys on `templateId`. Sections added before that
field existed carry `null` and are not restored; the editor labels them.

**And the editor now says so.** A section that occupies space and shows nothing
is labelled on the canvas rather than appearing as an unexplained coloured
band. Measured from the rendered DOM, not inferred from markup — whether a
section *looks* empty depends on CSS, container queries and images only the
browser has resolved. It skips anything under 64px, and treats a background
image as content.

---

## 13. Logos rendering as broken line-art

Reported from a side-by-side screenshot of the same navbar: in one, the
university crest and the social icons render correctly; in the other the crest
is outlines and the icons are garbled.

Both sanitisers kept their **own partial idea of what an inline SVG may
contain**, and both were badly incomplete. The template policy allowed eleven
tags and five attributes — `xmlns`, `viewBox`, `d`, `fill`, `stroke`. That is
enough to keep a `<path>` visible and loses everything that positions, masks or
fills it.

A test built from a realistic crest and icon row **failed 28 of 34
assertions**. Dropped: `<defs>`, `<clipPath>`, `<linearGradient>`, `<stop>`,
`<ellipse>`, `<text>`, and `transform`, `clip-path`, `fill-rule`, `clip-rule`,
`stroke-width`, `stroke-linecap`, `stroke-linejoin`, `fill-opacity`,
`gradientUnits`, `stop-color`, `preserveAspectRatio`, `cx`, `cy`, `rx`, `ry`,
`offset`, `text-anchor`, `font-size`.

Nothing breaks, which is what makes it expensive: the shield loses its clip
mask and its gradient and comes out as outlines, and the icon inverts because
`fill-rule="evenodd"` is what makes the hole in a glyph a hole. The page still
looks like a page.

**Fix.** One shared allowlist, `lib/sections/svg-allowlist.ts`, used by both
policies. They disagree about `<script>` deliberately; they must not also
disagree about what an SVG is, or a logo renders one way in the Admin's preview
and another way live.

**A detail worth knowing.** sanitize-html lower-cases *attribute* names but
preserves *tag* names — so `<clipPath>` arrives as `clipPath`, and an allowlist
spelled `clippath` matches nothing. Found by measurement after getting it
backwards first: with only lowercase forms allowed, `<linearGradient>` and
`<clipPath>` are silently discarded and their children hoisted into `<defs>`.
Both spellings are listed.

**Still refused,** and asserted for both policies: `<foreignObject>` (a route
back into HTML parsing, and from there into script), `<script>`, the
declarative-animation elements that can set arbitrary attributes over time,
event handlers, and `javascript:` URLs.

**Known gap.** This corrects the sanitiser; templates already stored with their
SVG stripped were damaged on write and do not repair themselves. Re-saving an
affected template in Admin › Templates puts it through the corrected pass.

---

## Verification

| Check | Scope | Result |
| :--- | :--- | :--- |
| Unit tests | xite-B | 173 passed (71 new) |
| Unit tests | xite-F | 105 passed (80 new) |
| API end-to-end | xite-B | 76 checks passed |
| `tsc --noEmit` | all three | 0 errors |
| Production build | all three | pass |
| ESLint | xite-F | 64 → 25 errors (remainder pre-existing, untouched files) |
| OpenAPI coverage gate | xite-B | 21/21 documented |
| Shared-file drift gate | xite-F / xite-B | 6 files match |
| section-runtime drift gate | xite-admin | matches; proven to fail on a 1-line change |
| Visual parity | webxite.org | served HTML byte-identical before/after (28,274 B) |

The parity result is the correct one: the live site was already rendering
sections the right way, and it is the *editor* that has been brought into line
with it. Both call one function, and the tests assert byte-equality rather than
similarity.

**Not run:** the 93-test Playwright suite (needs all three services and a
database) and a manual browser walkthrough with a signed-in tenant session. The
production probes prove the routes are deployed and guarded, not that the full
flow is correct end to end.

---

## Open

Not regressions from this work; each is a decision rather than a fix.

1. **Visitors can only ever see the home page.** Per-page editing works and
   persists, but no public route takes a page slug — `/site/[subdomain]` is the
   only published surface and `pickSections()` falls back to `pages[0]`. A
   tenant can build an About page, save it, reload it in the editor, and no
   visitor can reach it. Closing this needs a `/site/[subdomain]/[...page]`
   route plus navigation link rewriting.

2. **Section styling depends on a CDN that says it is not for production.** The
   Tailwind Play CDN prints its own warning on every page load of every tenant
   site, ships a compiler to every visitor, and puts section rendering one
   third-party outage away from unstyled. Replacing it means precompiling the
   utility classes sections actually use.

3. **`cookie-domain.ts` has genuinely drifted between the repos.** The backend
   copy carries a ten-line "derive the shared parent domain" branch the frontend
   lacks. This is session-cookie logic on a live multi-tenant platform, so it is
   reported rather than silently reconciled.

4. **The drift checker still cannot see across repos.** It hashes each repo's
   own copy against that repo's own manifest, so it catches "this file changed"
   but not "the two repos disagree" — which is how item 3 stayed green in both.
   `section-runtime.ts` is now covered against a shared hash in all three, which
   closes the highest-value case, but nothing enforces that the manifests are
   regenerated together.

5. **25 lint errors remain**, all in decorative UI components
   (`canvas-reveal-effect`, `3d-card`, `compare`, `sparkles`). Several of those
   components appear unused entirely and are candidates for deletion.
